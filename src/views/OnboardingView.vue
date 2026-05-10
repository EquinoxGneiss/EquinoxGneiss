<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore } from '@/stores/auth'
import { professions } from '@/lib/professions'

const router = useRouter()
const store = usePortfolioStore()
const auth = useAuthStore()

const selected = ref(null)
const saving = ref(false)
const saveError = ref('')

async function choose(id) {
  selected.value = id
  saving.value = true
  saveError.value = ''
  try {
    // Ensure ownerId is set (store may not have loaded yet on brand-new users)
    if (!store.ownerId) store.ownerId = auth.user?.id
    await store.updateProfession(id)
    router.replace('/admin')
  } catch (e) {
    saveError.value = e.message || 'Failed to save. Please try again.'
    saving.value = false
    selected.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
    <!-- Header -->
    <div class="text-center mb-10 max-w-xl">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-900/40">
        <span class="text-2xl">🌟</span>
      </div>
      <h1 class="text-3xl font-extrabold text-white mb-3">What do you do?</h1>
      <p class="text-gray-400 text-sm leading-relaxed">
        We'll tailor your portfolio layout and project fields to match your profession.
        You can change this anytime from your admin settings.
      </p>
    </div>

    <!-- Error -->
    <p v-if="saveError" class="text-red-400 text-sm mb-4">{{ saveError }}</p>

    <!-- Profession grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
      <button
        v-for="p in professions"
        :key="p.id"
        @click="choose(p.id)"
        :disabled="saving"
        :class="[
          'relative group text-left rounded-2xl border p-5 transition-all duration-200 focus:outline-none',
          selected === p.id
            ? 'border-purple-500 bg-purple-950/60 shadow-lg shadow-purple-900/30 ring-2 ring-purple-500'
            : 'border-gray-800 bg-gray-900 hover:border-purple-700 hover:bg-gray-800',
          saving && selected !== p.id ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        ]"
      >
        <!-- Spinner overlay when this card is saving -->
        <div v-if="saving && selected === p.id" class="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-900/70 z-10">
          <svg class="w-6 h-6 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>

        <div class="text-3xl mb-3 leading-none">{{ p.icon }}</div>
        <h3 class="text-white font-semibold text-sm mb-1">{{ p.label }}</h3>
        <p class="text-gray-500 text-xs leading-relaxed">{{ p.description }}</p>

        <!-- Checkmark when selected -->
        <div
          v-if="selected === p.id && !saving"
          class="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </button>
    </div>

    <p class="text-gray-600 text-xs mt-8">
      Don't see your profession? Pick <strong class="text-gray-400">Other / General</strong> — it works for any field.
    </p>
  </div>
</template>
