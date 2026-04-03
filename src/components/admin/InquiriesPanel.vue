<script setup>
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()
const expandedId = ref(null)

function toggle(inquiry) {
  if (expandedId.value === inquiry.id) {
    expandedId.value = null
  } else {
    expandedId.value = inquiry.id
    if (!inquiry.read) store.markInquiryRead(inquiry.id)
  }
}

function remove(id) {
  if (confirm('Delete this message?')) store.deleteInquiry(id)
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-3xl space-y-4">
    <!-- Summary -->
    <div class="flex items-center gap-4 text-sm text-gray-500">
      <span>{{ store.inquiries.length }} total</span>
      <span class="text-orange-500 font-medium">
        {{ store.inquiries.filter((i) => !i.read).length }} unread
      </span>
    </div>

    <!-- Empty state -->
    <div
      v-if="!store.inquiries.length"
      class="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center"
    >
      <div class="text-4xl mb-3 opacity-40">📬</div>
      <p class="text-gray-500 text-sm">No messages yet.</p>
    </div>

    <!-- Messages list -->
    <div v-else class="space-y-2">
      <div
        v-for="inquiry in store.inquiries"
        :key="inquiry.id"
        class="bg-white rounded-xl border transition-colors"
        :class="inquiry.read ? 'border-gray-200' : 'border-orange-200 bg-orange-50/30'"
      >
        <!-- Row -->
        <button
          @click="toggle(inquiry)"
          class="w-full flex items-start gap-3 p-4 text-left"
        >
          <!-- Unread dot -->
          <div class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="inquiry.read ? 'bg-gray-200' : 'bg-orange-400'"></div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-medium text-gray-900 text-sm truncate">{{ inquiry.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ inquiry.email }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs text-gray-400">{{ formatDate(inquiry.date) }}</p>
                <p v-if="inquiry.subject" class="text-xs text-gray-500 mt-0.5 truncate max-w-36">
                  {{ inquiry.subject }}
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-1 truncate">{{ inquiry.message }}</p>
          </div>
          <div class="shrink-0 mt-1">
            <svg
              class="w-4 h-4 text-gray-400 transition-transform"
              :class="expandedId === inquiry.id ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <!-- Expanded -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
        >
          <div v-if="expandedId === inquiry.id" class="px-4 pb-4 border-t border-gray-100">
            <div class="pt-3 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">From</p>
                  <p class="text-gray-700 font-medium">{{ inquiry.name }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Email</p>
                  <a :href="`mailto:${inquiry.email}`" class="text-indigo-600 hover:underline text-sm">
                    {{ inquiry.email }}
                  </a>
                </div>
                <div v-if="inquiry.subject" class="col-span-2">
                  <p class="text-xs text-gray-400 mb-0.5">Subject</p>
                  <p class="text-gray-700">{{ inquiry.subject }}</p>
                </div>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-1">Message</p>
                <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                  {{ inquiry.message }}
                </p>
              </div>
              <div class="flex gap-2 pt-1">
                <a
                  :href="`mailto:${inquiry.email}?subject=Re: ${inquiry.subject || 'Your inquiry'}`"
                  class="inline-flex items-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Reply via Email
                </a>
                <button
                  @click="remove(inquiry.id)"
                  class="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
