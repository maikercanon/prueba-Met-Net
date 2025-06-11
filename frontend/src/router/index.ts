import { createRouter, createWebHistory } from 'vue-router'

// Import components
import LoginForm from '../components/auth/LoginForm.vue'
import RegisterForm from '../components/auth/RegisterForm.vue'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm.vue'
import ResetPasswordForm from '../components/auth/ResetPasswordForm.vue'
import Dashboard from '../components/Dashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordForm,
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPasswordForm,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')
  return !!(token && user)
}

// Navigation guards
router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router 