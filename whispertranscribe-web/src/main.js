import { createApp } from 'vue'
import { Quasar, Notify } from 'quasar'
import iconSet from 'quasar/icon-set/material-symbols-outlined'
import router from './router'
import App from './App.vue'

import 'quasar/src/css/index.sass'
import './css/app.css'

const app = createApp(App)
app.use(Quasar, {
  plugins: { Notify },
  iconSet,
  config: {
    brand: {
      primary: '#0F3D3D',
      secondary: '#37474F',
      accent: '#1565C0',
      positive: '#1B5E20',
      negative: '#B71C1C',
      info: '#1565C0',
      warning: '#E65100',
      dark: '#1d1d1d',
    }
  }
})
app.use(router)
app.mount('#app')

if (import.meta.env.DEV) {
  import('./agentation.jsx')
}
