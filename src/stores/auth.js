import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const username = ref(null)
  const loading = ref(true)

  async function loadUsername(userId) {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle()
    username.value = data?.username ?? null
  }

  // Initialize session from Supabase on app load
  async function init() {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    if (user.value) await loadUsername(user.value.id)
    loading.value = false

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      if (user.value) await loadUsername(user.value.id)
      else username.value = null
    })
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    await loadUsername(data.user.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    username.value = null
  }

  const isAuthenticated = () => !!user.value

  return { user, username, loading, init, signIn, signOut, isAuthenticated }
})
