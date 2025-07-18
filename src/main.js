import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './index.css'
import router from './routes.js'
import { initializeTheme } from './utils/theme'
import { updateDocumentMeta } from './utils/documentMeta'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme and document meta based on domain
initializeTheme()
updateDocumentMeta()

app.mount('#app')

// Debug output
/* console.log('Available routes:', router.getRoutes().map(r => ({ 
  path: r.path,
  name: r.name
})))  */