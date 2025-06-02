import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './index.css'
import router from './routes.js'
import { initializeTheme } from './utils/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme based on domain
initializeTheme()

app.mount('#app')

// Debug output
console.log('Available routes:', router.getRoutes().map(r => ({ 
  path: r.path,
  name: r.name
}))) 