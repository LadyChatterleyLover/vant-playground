import { createApp } from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import '@vue/repl/style.css'
import 'uno.css'
import App from './App.vue'

createApp(App).use(Vant).mount('#app')
