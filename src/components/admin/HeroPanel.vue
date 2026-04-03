<script setup>
import { ref, watch } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

const form = ref({ ...store.hero })
const saved = ref(false)
const avatarError = ref(false)

watch(
  () => store.hero,
  (val) => {
    form.value = { ...val }
  }
)

function handleAvatarLoad() {
  avatarError.value = false
}
function handleAvatarError() {
  avatarError.value = true
}

function save() {
  store.updateHero({ ...form.value })
  saved.value = true
  setTimeout(() => (saved.value = false), 3000)
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <!-- Avatar preview -->
      <div class="flex items-center gap-5">
        <div class="shrink-0">
          <img
            v-if="form.avatar && !avatarError"
            :src="form.avatar"
            @load="handleAvatarLoad"
            @error="handleAvatarError"
            alt="Avatar preview"
            class="w-20 h-20 rounded-full object-cover border-2 border-purple-200"
          />
          <div
            v-else
            class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-200 flex items-center justify-center"
          >
            <span class="text-2xl font-bold text-purple-500">
              {{ (form.name || 'P').charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
          <input
            v-model="form.avatar"
            type="url"
            placeholder="https://example.com/your-photo.jpg"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
          <p class="text-xs text-gray-400 mt-1">Paste a direct image URL or leave blank for initials.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-400">*</span></label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Your full name"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. Full-Stack Developer"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Personal Quote / Message</label>
        <textarea
          v-model="form.quote"
          rows="2"
          placeholder="An inspiring quote or personal message..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">{{ form.quote?.length ?? 0 }} characters</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
        <textarea
          v-model="form.bio"
          rows="3"
          placeholder="A brief description about yourself..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">{{ form.bio?.length ?? 0 }} characters</p>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          @click="save"
          class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Save Changes
        </button>
        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <span v-if="saved" class="text-green-600 text-sm flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Saved!
          </span>
        </Transition>
      </div>
    </div>
  </div>
</template>
