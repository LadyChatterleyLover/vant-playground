import { reactive, watchEffect } from 'vue'
import { File, compileFile } from '@vue/repl'
import type { OutputModes, SFCOptions, Store, StoreState } from '@vue/repl'
import type { PendingCompiler, ReplStoreParam, VersionKey, VersionRecord } from '@/types'
import { defaultCode, defaultFile, genImportsMap, vantCode, vantFile } from '@/const'
import { decodeData, encodeData, genLink } from '@/utils'

const getInitFiles = (serializedState = '') => {
  let files: StoreState['files'] = {
    [defaultFile]: new File(defaultFile, defaultCode),
  }
  if (serializedState) {
    try {
      files = {}
      const res = JSON.parse(decodeData(serializedState))
      for (const filename of Object.keys(res)) {
        files[filename] = new File(filename, res[filename])
      }
    } catch (err) {
      console.log(err)
      console.log('Json parse error: src/repl-store/index.ts')
    }
  }

  return files
}

const genVueLink = (version: string) => {
  const compilerSfc = genLink(
    '@vue/compiler-sfc',
    version,
    '/dist/compiler-sfc.esm-browser.js',
  )
  const runtimeDom = genLink(
    '@vue/runtime-dom',
    version,
    '/dist/runtime-dom.esm-browser.js',
  )

  return {
    compilerSfc,
    runtimeDom,
  }
}

const genImports = (versions: VersionRecord) => {
  const deps: Record<string, {
    pkg: string
    version: string
    file: string
  }> = {
    ...genImportsMap(versions),
  }
  return Object.fromEntries(
    Object.entries(deps).map(([key, info]) => [key, genLink(info.pkg, info.version, info.file)])
  )
}

export class ReplStore implements Store {
  state: StoreState
  compiler!: typeof import('vue/compiler-sfc')
  options?: SFCOptions
  versions: VersionRecord
  initialShowOutput = false
  initialOutputMode: OutputModes = 'preview'

  private pendingCompiler: PendingCompiler = null

  constructor({
    serializedState = '',
    versions = { Vue: '3.3.4', Vant: '4.7.0' },
  }: ReplStoreParam) {
    const files = getInitFiles(serializedState)
    const mainFile = files[defaultFile] ? defaultFile : Object.keys(files)[0]
    this.state = reactive({
      mainFile,
      files,
      activeFile: files[mainFile],
      errors: [],
      vueRuntimeURL: '',
      vueServerRendererURL: '',
      resetFlip: false,
      typescriptVersion: 'latest',
    })
    this.versions = versions
    this.initImportMap()
  }

  private initImportMap() {
    if (!this.state.files['import-map.json']) {
      this.state.files['import-map.json'] = new File(
        'import-map.json',
        JSON.stringify({ imports: {} }, null, 2)
      )
    }
  }

  async init() {
    await this.setVueVersion(this.versions.Vue)
    await this.setVantVersion(this.versions.Vant)

    watchEffect(() => compileFile(this, this.state.activeFile))

    for (const file of Object.keys(this.state.files)) {
      if (file !== defaultFile) {
        compileFile(this, this.state.files[file])
      }
    }
  }


  setActive(filename: string) {
    this.state.activeFile = this.state.files[filename]
  }

  public addFile(fileOrFilename: string | File) {
    const file = typeof fileOrFilename === 'string' ?
      new File(fileOrFilename) :
      fileOrFilename
    this.state.files[file.filename] = file

    if (!file.hidden) this.setActive(file.filename)
  }

  public deleteFile(filename: string) {
    if (window?.confirm(`Confirm to delete ${filename}?`)) {
      if (this.state.activeFile.filename === filename) {
        this.state.activeFile = this.state.files[this.state.mainFile]
      }
      delete this.state.files[filename]
    }
  }

  public getFiles() {
    const exported: Record<string, string> = {}
    for (const filename of Object.keys(this.state.files)) {
      exported[filename] = this.state.files[filename].code
    }
    return exported
  }

  async setFiles(newFiles: Record<string, string>, mainFile = defaultFile) {
    const files: Record<string, File> = {}
    if (mainFile === defaultFile && !newFiles[mainFile]) {
      files[mainFile] = new File(mainFile, defaultCode)
    }
    for (const [filename, file] of Object.entries(newFiles)) {
      files[filename] = new File(filename, file)
    }
    for (const file of Object.values(files)) {
      await compileFile(this, file)
    }
    this.state.mainFile = mainFile
    this.state.files = files
    this.initImportMap()
    this.setActive(mainFile)
  }

  private setImportMap(map: { imports: Record<string, string> }) {
    try {
      this.state.files['import-map.json'].code = JSON.stringify(map, null, 2)
    } catch (e) {
      this.state.errors = [
        `stringify error in import-map.json: ${(e as Error).message}`,
      ]
    }
  }

  renameFile(oldFilename: string, newFilename: string) {
    const file = this.state.files[oldFilename]

    if (!file) {
      this.state.errors = [`Could not rename "${oldFilename}", file not found`]
      return
    }

    if (!newFilename || oldFilename === newFilename) {
      this.state.errors = [`Cannot rename "${oldFilename}" to "${newFilename}"`]
      return
    }

    file.filename = newFilename

    const newFiles: Record<string, File> = {}

    for (const name of Object.keys(this.state.files)) {
      if (name === oldFilename) {
        newFiles[newFilename] = file
      } else {
        newFiles[name] = this.state.files[name]
      }
    }

    this.state.files = newFiles
    compileFile(this, file)
  }

  serialize() {
    const arr = Object
      .entries(this.getFiles())
      .filter(([file]) => file !== vantFile)
      .map(([file, content]) => {
        if (file === 'import-map.json') {
          try {
            const importMap = JSON.stringify(this.getImportMap())
            return [file, importMap]
            // eslint-disable-next-line no-empty
          } catch { }
        }
        return [file, content]
      })
    const data = JSON.stringify(Object.fromEntries(arr))
    return `#${encodeData(data)}`
  }

  getImportMap() {
    try {
      return JSON.parse(this.state.files['import-map.json'].code)
    } catch (e) {
      this.state.errors = [
        `Syntax error in import-map.json: ${(e as Error).message}`,
      ]
      return {}
    }
  }

  private addDeps() {
    const importMap = this.getImportMap()
    importMap.imports = {
      ...importMap.imports,
      ...genImports(this.versions),
    }
    this.setImportMap(importMap)
  }

  public async setVersion(key: VersionKey, version: string) {
    switch (key) {
      case 'Vant':
        await this.setVantVersion(version)
        compileFile(this, this.state.files[vantFile])
        break
      case 'Vue':
        await this.setVueVersion(version)
        break
    }
  }

  private async setVantVersion(version: string) {
    this.versions.Vant = version
    const href = genLink('vant', version, '/lib/index.css')
    this.state.files[vantFile] = new File(
      vantFile,
      vantCode.replace('#VANT_CSS_HREF#', href),
      false,
    )
    this.addDeps()
  }

  private async setVueVersion(version: string) {
    const { compilerSfc, runtimeDom } = genVueLink(version)

    this.pendingCompiler = import(/* @vite-ignore */compilerSfc)
    this.compiler = await this.pendingCompiler
    this.pendingCompiler = null

    this.state.vueRuntimeURL = runtimeDom

    this.versions.Vue = version

    this.addDeps()
  }
}
