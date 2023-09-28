import path from 'path'
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import { presetUno } from 'unocss'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Inspect from 'vite-plugin-inspect'

const basePath = path.resolve(__dirname, 'src')

export default defineConfig(async () => {

  return {
    base: './',
    resolve: {
      alias: {
        '@': basePath,
      },
    },

    plugins: [
      vue({
        reactivityTransform: `${basePath}/**/*`,
      }),
      AutoImport({
        imports: ['vue', '@vueuse/core'],
        dts: path.resolve(`${basePath}/types/dts`, 'auto-imports.d.ts'),
      }),
      Unocss({
        presets: [presetUno()],
      }),
      Inspect(),
    ],
  }
})
