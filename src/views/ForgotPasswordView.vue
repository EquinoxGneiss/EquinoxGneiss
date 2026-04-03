<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!email.value.trim()) {
    error.value = 'Please enter your email address.'
    return
  }
  loading.value = true
  const { error: err } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
    redirectTo: `${window.location.origin}/auth/callback`,
  })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    sent.value = true
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-sm">
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-black/40">

        <!-- Success state -->
        <div v-if="sent" class="text-center py-4">
          <div class="w-14 h-14 rounded-full bg-green-900/40 border border-green-700/50 flex items-center justify-center mx-auto mb-5">
            <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-white font-bold text-lg mb-2">Check your email</h2>
          <p class="text-gray-400 text-sm mb-6">
            We sent a password reset link to<br />
            <span class="text-purple-400 font-medium">{{ email }}</span>
          </p>
          <p class="text-gray-600 text-xs mb-6">
            Didn't receive it? Check your spam folder or try again.
          </p>
          <button @click="sent = false; email = ''"
            class="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2">
            Try a different email
          </button>
        </div>

        <!-- Form state -->
        <template v-else>
          <div class="text-center mb-8">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold text-white">Forgot Password?</h1>
            <p class="text-gray-500 text-sm mt-1">Enter your email and we'll send a reset link.</p>
          </div>

          <!-- Error -->
          <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
            <div v-if="error" class="mb-5 flex items-start gap-2.5 bg-red-950/60 border border-red-700/50 text-red-400 text-sm rounded-xl px-4 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>
          </Transition>

          <form @submit.prevent="submit" novalidate class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
              <input
                v-model="email"
                type="email"
                placeholder="admin@example.com"
                autocomplete="email"
                class="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-gray-600"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 text-sm"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending...
              </span>
              <span v-else>Send Reset Link</span>
            </button>
          </form>
        </template>

        <!-- Back to login -->
        <div class="mt-6 text-center">
          <a href="/admin" class="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
