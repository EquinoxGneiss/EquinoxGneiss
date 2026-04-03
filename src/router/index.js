import { createRouter, createWebHistory } from 'vue-router'
import PortfolioView from '@/views/PortfolioView.vue'
import AdminView from '@/views/AdminView.vue'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import SetPasswordView from '@/views/SetPasswordView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'portfolio',
      component: PortfolioView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallbackView,
    },
    {
      path: '/set-password',
      name: 'set-password',
      component: SetPasswordView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// Catch Supabase invite/magic-link tokens that land on the wrong route.
// This happens when the Supabase Redirect URL is set to the site root
// instead of /auth/callback. We intercept and forward transparently.
router.beforeEach((to) => {
  const { hash, search, origin } = window.location
  const hasToken = hash.includes('access_token=') || search.includes('code=')

  if (hasToken && to.path !== '/auth/callback') {
    // Use full page replace so the hash (#access_token=...) is preserved
    window.location.replace(`${origin}/auth/callback${search}${hash}`)
    return false
  }
})

export default router
