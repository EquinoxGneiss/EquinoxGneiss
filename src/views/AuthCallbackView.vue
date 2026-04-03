<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  const { search, hash } = window.location
  let err
  let tokenType = ''

  if (hash.includes('access_token=')) {
    // Implicit flow — token arrives in URL hash
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    tokenType = params.get('type') ?? ''

    if (!access_token) {
      err = { message: 'Missing access_token in URL.' }
    } else {
      const result = await supabase.auth.setSession({ access_token, refresh_token })
      err = result.error
    }
  } else if (search.includes('code=')) {
    // PKCE fallback — handles any existing code-based links still in circulation
    const result = await supabase.auth.exchangeCodeForSession(window.location.href)
    err = result.error
    tokenType = new URLSearchParams(search).get('type') ?? ''
  } else {
    err = { message: 'No authentication parameters found in URL.' }
  }

  // Remove token from address bar
  history.replaceState(null, '', window.location.pathname)

  if (err) {
    error.value = err.message
  } else if (tokenType === 'invite' || tokenType === 'recovery') {
    // First-time invite or password reset → force user to set a password
    router.replace('/set-password')
  } else {
    // Magic-link sign-in: check if this is a new user (no profile row yet).
    // New users need to pick a username and set a password before reaching /admin.
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      if (!profile) {
        router.replace('/set-password')
        return
      }
    }
    router.replace('/admin')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="text-center">
      <div v-if="!error" class="flex flex-col items-center gap-4">
        <svg class="w-10 h-10 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p class="text-gray-400 text-sm">Verifying your account, please wait...</p>
      </div>

      <div v-else class="max-w-sm">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="text-white font-semibold text-lg mb-2">Verification failed</h2>
        <p class="text-red-400 text-sm mb-3">{{ error }}</p>
        <p class="text-gray-500 text-xs mb-6 leading-relaxed">
          This usually happens when the link is opened in a different browser
          than the one you used to request it. Try clicking the link again, or
          request a new one.
        </p>
        <a
          href="/admin"
          class="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  </div>
</template>
