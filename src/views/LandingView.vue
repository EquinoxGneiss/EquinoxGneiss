<script setup>
import { ref, nextTick } from 'vue'
import { supabase } from '@/lib/supabase'

// Turnstile is only active when a real site key is configured.
// For development without a key, CAPTCHA is skipped entirely.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
const hasCaptcha = !!SITE_KEY

const showModal = ref(false)
const email = ref('')
const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')
const captchaToken = ref('')
let widgetId = null

async function loadTurnstileScript() {
  if (window.turnstile) return
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function openModal() {
  showModal.value = true
  submitted.value = false
  submitError.value = ''
  email.value = ''
  captchaToken.value = ''
  widgetId = null
  if (!hasCaptcha) return
  await loadTurnstileScript()
  await nextTick()
  widgetId = window.turnstile.render('#turnstile-container', {
    sitekey: SITE_KEY,
    theme: 'dark',
    callback: (token) => { captchaToken.value = token },
    'expired-callback': () => { captchaToken.value = '' },
    'error-callback': () => { captchaToken.value = '' },
  })
}

function closeModal() {
  showModal.value = false
  if (hasCaptcha && window.turnstile && widgetId !== null) {
    window.turnstile.remove(widgetId)
    widgetId = null
  }
}

async function submit() {
  submitError.value = ''
  const trimmedEmail = email.value.trim().toLowerCase()
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    submitError.value = 'Please enter a valid email address.'
    return
  }
  if (hasCaptcha && !captchaToken.value) {
    submitError.value = 'Please complete the CAPTCHA verification.'
    return
  }
  submitting.value = true
  try {
    const options = {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
    if (hasCaptcha) options.captchaToken = captchaToken.value
    const { error } = await supabase.auth.signInWithOtp({ email: trimmedEmail, options })
    if (error) throw error
    submitted.value = true
  } catch (e) {
    submitError.value = e.message || 'Something went wrong. Please try again.'
    if (hasCaptcha && window.turnstile && widgetId !== null) {
      window.turnstile.reset(widgetId)
    }
    captchaToken.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
    <!-- Background blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative">
      <!-- Logo -->
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-600/30">
        <span class="text-3xl">⚡</span>
      </div>

      <h1 class="text-5xl font-extrabold text-white mb-3 tracking-tight">Folio</h1>
      <p class="text-gray-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
        Your personal portfolio, powered by Vue.js.<br />Build yours in minutes.
      </p>

      <button
        @click="openModal"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/30 text-sm"
      >
        Manage your portfolio
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Sign-up / sign-in modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc.window="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeModal"></div>

        <!-- Panel -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          appear
        >
          <div class="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-black/60">
            <!-- Close -->
            <button
              @click="closeModal"
              class="absolute top-4 right-4 text-gray-600 hover:text-gray-400 transition-colors p-1 rounded-lg hover:bg-gray-800"
              aria-label="Close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- ── SUCCESS STATE ── -->
            <div v-if="submitted" class="text-center py-4">
              <div class="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-white mb-2">Check your inbox!</h2>
              <p class="text-gray-400 text-sm leading-relaxed mb-1">We've sent a sign-in link to</p>
              <p class="text-purple-400 font-semibold text-sm mb-5 font-mono">{{ email }}</p>
              <p class="text-gray-500 text-xs leading-relaxed">
                Click the link in the email to access your portfolio dashboard.<br />
                The link expires in <span class="text-gray-400">1 hour</span>. Check your spam folder if you don't see it.
              </p>
              <button
                @click="submitted = false"
                class="mt-6 text-xs text-gray-500 hover:text-gray-400 underline underline-offset-2 transition-colors"
              >
                Use a different email
              </button>
            </div>

            <!-- ── FORM STATE ── -->
            <div v-else>
              <div class="text-center mb-7">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/30">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-white">Get started</h2>
                <p class="text-gray-500 text-sm mt-1.5 leading-relaxed">
                  Enter your email and we'll send you a magic link.<br />No password required.
                </p>
              </div>

              <!-- Error banner -->
              <div v-if="submitError" class="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {{ submitError }}
              </div>

              <form @submit.prevent="submit" novalidate class="space-y-5">
                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1.5">Email address</label>
                  <input
                    v-model="email"
                    type="email"
                    placeholder="you@example.com"
                    autocomplete="email"
                    maxlength="254"
                    required
                    class="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-gray-600"
                  />
                  <p class="text-gray-600 text-xs mt-1.5">Must be a real address — the link expires in 1 hour.</p>
                </div>

                <!-- Turnstile CAPTCHA (only rendered when site key is configured) -->
                <div v-if="hasCaptcha" class="flex flex-col items-center gap-2">
                  <div id="turnstile-container"></div>
                  <p class="text-gray-600 text-xs">CAPTCHA verification to prevent bots</p>
                </div>

                <!-- Submit -->
                <button
                  type="submit"
                  :disabled="submitting || (hasCaptcha && !captchaToken)"
                  class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 text-sm"
                >
                  <span v-if="submitting" class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending…
                  </span>
                  <span v-else>Send me the link →</span>
                </button>
              </form>

              <p class="text-center text-gray-600 text-xs mt-5">
                Already have an account?
                <a href="/admin" class="text-purple-400 hover:text-purple-300 transition-colors ml-0.5">Sign in →</a>
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

