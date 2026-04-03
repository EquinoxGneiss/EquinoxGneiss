<script setup>
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

const saving = ref(false)
const savedId = ref(null)
const saveError = ref('')

const themes = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'Deep dark background with purple & indigo accents. The default look.',
    swatches: ['#030712', '#a78bfa', '#818cf8'],
    preview: 'bg-gray-950',
  },
  {
    id: 'glass',
    label: 'Glassmorphism',
    description: 'Blurred glass cards over a deep purple base with fuchsia highlights.',
    swatches: ['#0f0524', '#e879f9', '#c084fc'],
    preview: 'bg-purple-950',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean white background with dark text and a crisp blue accent.',
    swatches: ['#f9fafb', '#111827', '#2563eb'],
    preview: 'bg-gray-50',
  },
  {
    id: 'sketchy',
    label: 'Sketchy',
    description: 'Warm cream tones with hand-drawn card borders and Caveat headings.',
    swatches: ['#fdf8f0', '#1c1917', '#d97706'],
    preview: 'bg-amber-50',
  },
]

async function selectTheme(id) {
  if (id === store.theme || saving.value) return
  saving.value = true
  saveError.value = ''
  savedId.value = null
  try {
    await store.updateTheme(id)
    savedId.value = id
    setTimeout(() => (savedId.value = null), 2500)
  } catch (e) {
    saveError.value = e.message === 'timeout'
      ? 'Database is still waking up. Please try again in a few seconds.'
      : (e.message || 'Failed to save theme.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-900">Portfolio Theme</h2>
      <p class="text-gray-500 text-sm mt-1">
        Choose a visual style for your public portfolio. Changes apply live instantly.
      </p>
    </div>

    <!-- Error -->
    <div v-if="saveError" class="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
      {{ saveError }}
    </div>

    <!-- Retrying notice -->
    <div v-if="store.retrying" class="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
      <svg class="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Database is waking up — retrying automatically...
    </div>

    <!-- Theme grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="theme in themes"
        :key="theme.id"
        @click="selectTheme(theme.id)"
        :disabled="saving"
        :class="[
          'relative text-left rounded-xl border-2 p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
          store.theme === theme.id
            ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm',
          saving && store.theme !== theme.id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ]"
      >
        <!-- Selected check -->
        <div
          v-if="store.theme === theme.id"
          class="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Saving spinner on the card being saved -->
        <div
          v-if="saving && store.theme !== theme.id"
          class="absolute top-3 right-3"
        >
          <svg class="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>

        <!-- Color swatches -->
        <div class="flex items-center gap-2 mb-3">
          <div
            v-for="(color, idx) in theme.swatches"
            :key="idx"
            class="w-6 h-6 rounded-full border border-black/10 shadow-sm"
            :style="{ background: color }"
          ></div>
        </div>

        <!-- Label + description -->
        <p class="font-semibold text-gray-900 text-sm mb-1">{{ theme.label }}</p>
        <p class="text-gray-500 text-xs leading-relaxed">{{ theme.description }}</p>

        <!-- Saved flash -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <span
            v-if="savedId === theme.id"
            class="absolute bottom-3 right-3 text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full"
          >
            Saved!
          </span>
        </Transition>
      </button>
    </div>

    <p class="text-gray-400 text-xs mt-5">
      Theme only affects your public portfolio at
      <span class="font-mono text-purple-500">/:username</span>.
      The admin dashboard always uses its own style.
    </p>
  </div>
</template>
