<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()

// â”€â”€â”€ Wizard state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const step = ref(1)
const checkingMount = ref(true)
const usernameAlreadySet = ref(false)

// â”€â”€â”€ Step 1 â€” username â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const username = ref('')
// 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
const usernameStatus = ref('idle')
let debounceTimer = null

const RESERVED = new Set(['admin', 'auth', 'set-password', 'forgot-password', 'api', 'www'])
const USERNAME_RE = /^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/

function validateFormat(val) {
  if (!val || RESERVED.has(val)) return false
  return USERNAME_RE.test(val)
}

function onUsernameInput() {
  clearTimeout(debounceTimer)
  const val = username.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
  username.value = val
  if (!val) { usernameStatus.value = 'idle'; return }
  if (!validateFormat(val)) { usernameStatus.value = 'invalid'; return }
  usernameStatus.value = 'checking'
  debounceTimer = setTimeout(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', val)
      .maybeSingle()
    usernameStatus.value = data ? 'taken' : 'available'
  }, 400)
}

const canProceed = computed(() => usernameStatus.value === 'available')

function nextStep() {
  if (canProceed.value) step.value = 2
}

// â”€â”€â”€ Step 2 â€” password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const password = ref('')
const confirm = ref('')
const showPass = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const error = ref('')

const rules = {
  minLength: (v) => v.length >= 8,
  hasUpper: (v) => /[A-Z]/.test(v),
  hasNumber: (v) => /[0-9]/.test(v),
}
const strength = (v) => Object.values(rules).filter((r) => r(v)).length

// â”€â”€â”€ Mount: detect recovery flow (user already has username) â”€â”€
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.username) {
      usernameAlreadySet.value = true
      step.value = 2
    }
  }
  checkingMount.value = false
})

// â”€â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function submit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (strength(password.value) < 3) {
    error.value = 'Password does not meet the requirements.'
    return
  }
  loading.value = true
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Session expired. Please restart the process.')

    if (!usernameAlreadySet.value) {
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({ id: user.id, username: username.value })
      if (profileErr) {
        if (profileErr.code === '23505') {
          throw new Error('That username was just taken. Please go back and choose another.')
        }
        throw new Error(profileErr.message)
      }
    }

    const { error: pwErr } = await supabase.auth.updateUser({ password: password.value })
    if (pwErr) throw new Error(pwErr.message)

    router.replace('/admin')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Loading while checking existing profile -->
    <div v-if="checkingMount" class="relative flex flex-col items-center gap-3">
      <svg class="w-8 h-8 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>

    <div v-else class="relative w-full max-w-sm">
      <!-- Step indicator -->
      <div v-if="!usernameAlreadySet" class="flex items-center justify-center gap-2 mb-6">
        <div class="flex items-center gap-2">
          <span
            :class="step === 1 ? 'bg-purple-600 text-white' : 'bg-purple-900/60 text-purple-300'"
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
          >1</span>
          <span :class="step === 1 ? 'text-white' : 'text-gray-500'" class="text-xs transition-colors">Username</span>
        </div>
        <div class="w-8 h-px" :class="step === 2 ? 'bg-purple-600' : 'bg-gray-700'"></div>
        <div class="flex items-center gap-2">
          <span
            :class="step === 2 ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-600'"
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
          >2</span>
          <span :class="step === 2 ? 'text-white' : 'text-gray-500'" class="text-xs transition-colors">Password</span>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-black/40">

        <!-- â”€â”€ STEP 1: Choose username â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <Transition
          mode="out-in"
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="step === 1" key="step1">
            <div class="text-center mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Choose Your Username</h1>
              <p class="text-gray-500 text-sm mt-1">This will be your public portfolio URL.</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">folio-two-teal.vercel.app/</span>
                  <input
                    v-model="username"
                    @input="onUsernameInput"
                    type="text"
                    placeholder="your-name"
                    autocomplete="username"
                    spellcheck="false"
                    class="w-full bg-gray-800 border text-white rounded-xl pl-[8.5rem] pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition placeholder-gray-600"
                    :class="{
                      'border-gray-700 focus:border-purple-500': usernameStatus === 'idle' || usernameStatus === 'checking',
                      'border-green-500': usernameStatus === 'available',
                      'border-red-600': usernameStatus === 'taken' || usernameStatus === 'invalid',
                    }"
                  />
                  <!-- Status icon -->
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg v-if="usernameStatus === 'checking'" class="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <svg v-else-if="usernameStatus === 'available'" class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else-if="usernameStatus === 'taken' || usernameStatus === 'invalid'" class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>

                <!-- Status messages -->
                <p v-if="usernameStatus === 'available'" class="text-green-400 text-xs mt-1.5">Available!</p>
                <p v-else-if="usernameStatus === 'taken'" class="text-red-400 text-xs mt-1.5">Already taken. Try another.</p>
                <p v-else-if="usernameStatus === 'invalid'" class="text-red-400 text-xs mt-1.5">
                  3-20 chars, lowercase letters, numbers, and hyphens only.
                </p>
                <p v-else class="text-gray-600 text-xs mt-1.5">3-20 characters &middot; letters, numbers, hyphens</p>
              </div>

              <button
                type="button"
                @click="nextStep"
                :disabled="!canProceed"
                class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 text-sm"
              >
                Continue &rarr;
              </button>
            </div>
          </div>

          <!-- â”€â”€ STEP 2: Set password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div v-else key="step2">
            <div class="text-center mb-8">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 class="text-xl font-bold text-white">Set Your Password</h1>
              <p class="text-gray-500 text-sm mt-1">
                <span v-if="!usernameAlreadySet">
                  One more step,
                  <span class="text-purple-400 font-mono">@{{ username }}</span>.
                </span>
                <span v-else>Create a secure password for your account.</span>
              </p>
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
              <!-- New password -->
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Min. 8 characters"
                    autocomplete="new-password"
                    class="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition placeholder-gray-600"
                  />
                  <button type="button" @click="showPass = !showPass"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    <svg v-if="!showPass" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>

                <!-- Requirements -->
                <ul v-if="password" class="mt-2 space-y-1">
                  <li v-for="(fn, label) in { 'At least 8 characters': rules.minLength, 'One uppercase letter': rules.hasUpper, 'One number': rules.hasNumber }"
                    :key="label"
                    :class="fn(password) ? 'text-green-400' : 'text-gray-600'"
                    class="flex items-center gap-1.5 text-xs transition-colors">
                    <svg v-if="fn(password)" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
                    </svg>
                    {{ label }}
                  </li>
                </ul>
              </div>

              <!-- Confirm -->
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
                <div class="relative">
                  <input
                    v-model="confirm"
                    :type="showConfirm ? 'text' : 'password'"
                    placeholder="Repeat your password"
                    autocomplete="new-password"
                    class="w-full bg-gray-800 border text-white rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition placeholder-gray-600"
                    :class="confirm && confirm !== password ? 'border-red-600' : 'border-gray-700 focus:border-purple-500'"
                  />
                  <button type="button" @click="showConfirm = !showConfirm"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    <svg v-if="!showConfirm" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
                <p v-if="confirm && confirm !== password" class="text-red-400 text-xs mt-1">Passwords do not match.</p>
              </div>

              <div class="flex gap-2 pt-2">
                <button
                  v-if="!usernameAlreadySet"
                  type="button"
                  @click="step = 1"
                  class="px-4 py-3 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl text-sm transition-colors"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  :disabled="loading || !password || !confirm"
                  class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 text-sm"
                >
                  <span v-if="loading" class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving...
                  </span>
                  <span v-else>Set Password &amp; Continue</span>
                </button>
              </div>
            </form>
          </div>
        </Transition>

      </div>
    </div>
  </div>
</template>
