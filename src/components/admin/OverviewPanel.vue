<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

const unread = computed(() => store.inquiries.filter((i) => !i.read).length)

const stats = computed(() => [
  {
    label: 'Achievements',
    value: store.achievements.length,
    icon: '🏆',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    label: 'Projects',
    value: store.projects.length,
    icon: '💻',
    color: 'from-indigo-600 to-blue-600',
  },
  {
    label: 'Total Inquiries',
    value: store.inquiries.length,
    icon: '📬',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    label: 'Unread Messages',
    value: unread.value,
    icon: '🔔',
    color: 'from-rose-600 to-pink-600',
  },
])
</script>

<template>
  <div class="space-y-8">
    <!-- Stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
      >
        <div
          :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shrink-0`"
        >
          {{ stat.icon }}
        </div>
        <div>
          <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-gray-500 text-sm">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Quick guide -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="font-semibold text-gray-800 mb-4 text-lg">Quick Guide</h3>
      <ul class="space-y-3 text-sm text-gray-600">
        <li class="flex items-start gap-3">
          <span class="text-purple-500 font-bold mt-0.5">1.</span>
          <span><strong class="text-gray-700">Profile & Hero</strong> — Set your name, title, personal quote, bio, and avatar URL.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-purple-500 font-bold mt-0.5">2.</span>
          <span><strong class="text-gray-700">Achievements</strong> — Add photos of your awards, certifications, and milestones.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-purple-500 font-bold mt-0.5">3.</span>
          <span><strong class="text-gray-700">Projects</strong> — Showcase your work with descriptions, tech stack, and links.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-purple-500 font-bold mt-0.5">4.</span>
          <span><strong class="text-gray-700">Social Links</strong> — Link your Facebook, Instagram, and LinkedIn profiles.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-purple-500 font-bold mt-0.5">5.</span>
          <span><strong class="text-gray-700">Inquiries</strong> — Read and manage messages sent via the contact form.</span>
        </li>
      </ul>
    </div>

    <!-- Notice -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
      <p>
        <strong>Storage note:</strong> All data is saved in your browser's localStorage. It persists
        across page refreshes but is specific to this browser. To share across devices, export the
        data or integrate a backend.
      </p>
    </div>
  </div>
</template>
