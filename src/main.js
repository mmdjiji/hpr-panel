import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { initTheme } from './utils/theme'
import Dashboard from './views/Dashboard.vue'
import Repositories from './views/Repositories.vue'
import Jobs from './views/Jobs.vue'
import Config from './views/Config.vue'
import Login from './views/Login.vue'
import { authGuard } from './utils/auth'

const routes = [
  { 
    path: '/', 
    redirect: '/dashboard' 
  },
  { 
    path: '/login', 
    component: Login 
  },
  {
    path: '/',
    component: () => import('./components/Layout.vue'),
    beforeEnter: authGuard,
    children: [
      { 
        path: 'dashboard', 
        component: Dashboard
      },
      { 
        path: 'repositories', 
        component: Repositories
      },
      { 
        path: 'jobs', 
        component: Jobs
      },
      { 
        path: 'config', 
        component: Config
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 初始化主题
initTheme()

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
