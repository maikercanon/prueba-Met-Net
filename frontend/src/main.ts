import './style.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Use Vue Router
app.use(router)

app.mount('#app')
