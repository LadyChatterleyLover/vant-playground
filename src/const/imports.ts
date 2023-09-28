import { VersionRecord } from '@/types'

export const genImportsMap = (versions: VersionRecord) => {
  const { Vue, Vant } = versions

  return {
    vant: {
      pkg: 'vant',
      version: Vant,
      file: '/lib/vant.es.js',
    },
    '@vant/use': {
      pkg: '@vant/use',
      version: '1.6.0',
      file: '/dist/index.esm.mjs',
    },
    '@vant/popperjs': {
      pkg: '@vant/popperjs',
      version: '1.3.0',
      file: '/dist/index.esm.mjs',
    },
    vue: {
      pkg: 'vue',
      version: Vue,
      file: '/dist/vue.esm-browser.js',
    },
    '@vue/shared': {
      pkg: '@vue/shared',
      version: '3.0.0',
      file: '/dist/shared.esm-bundler.js',
    },
  }
}
