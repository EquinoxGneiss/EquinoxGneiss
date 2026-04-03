<script setup>
import { ref, computed, markRaw, watch, onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore } from '@/stores/auth'
import LoginPanel from '@/components/admin/LoginPanel.vue'
import OverviewPanel from '@/components/admin/OverviewPanel.vue'
import HeroPanel from '@/components/admin/HeroPanel.vue'
import AchievementsPanel from '@/components/admin/AchievementsPanel.vue'
import ProjectsPanel from '@/components/admin/ProjectsPanel.vue'
import SocialPanel from '@/components/admin/SocialPanel.vue'
import InquiriesPanel from '@/components/admin/InquiriesPanel.vue'
import ThemePanel from '@/components/admin/ThemePanel.vue'

const store = usePortfolioStore()
const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
  // Auth is now resolved — fetch portfolio data for the signed-in user.
  if (auth.user) store.fetchForOwner(auth.user.id)
})

// Also re-fetch when sign-in happens mid-session (e.g. from LoginPanel).
watch(
  () => auth.user,
  (newUser) => { if (newUser) store.fetchForOwner(newUser.id) },
)

const activeTab = ref('overview')
const sidebarOpen = ref(false)

const unreadCount = computed(() => store.inquiries.filter((i) => !i.read).length)

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    emoji: '📊',
    component: markRaw(OverviewPanel),
  },
  {
    id: 'hero',
    label: 'Profile & Hero',
    emoji: '👤',
    component: markRaw(HeroPanel),
  },
  {
    id: 'achievements',
    label: 'Achievements',
    emoji: '🏆',
    component: markRaw(AchievementsPanel),
  },
  {
    id: 'projects',
    label: 'Projects',
    emoji: '💻',
    component: markRaw(ProjectsPanel),
  },
  {
    id: 'social',
    label: 'Social Links',
    emoji: '🔗',
    component: markRaw(SocialPanel),
  },
  {
    id: 'inquiries',
    label: 'Inquiries',
    emoji: '📬',
    component: markRaw(InquiriesPanel),
    badge: unreadCount,
  },
  {
    id: 'theme',
    label: 'Theme',
    emoji: '🎨',
    component: markRaw(ThemePanel),
  },
]

const currentTab = computed(() => tabs.find((t) => t.id === activeTab.value))
const currentComponent = computed(() => currentTab.value?.component)

function navigate(id) {
  activeTab.value = id
  sidebarOpen.value = false
}
</script>

<template>
  <!-- Loading state while checking session -->
  <div v-if="auth.loading" class="min-h-screen bg-gray-950 flex items-center justify-center">
    <div class="flex flex-col items-center gap-3">
      <svg class="w-8 h-8 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <p class="text-gray-600 text-sm">Checking session...</p>
    </div>
  </div>

  <!-- Not authenticated → show login -->
  <LoginPanel v-else-if="!auth.user" />

  <!-- Authenticated → show dashboard -->
  <div v-else class="flex h-screen bg-gray-50 font-sans antialiased overflow-hidden">
    <!-- Sidebar overlay (mobile) -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="lg:hidden fixed inset-0 bg-black/50 z-40"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:static z-50 h-full w-64 bg-gray-900 flex flex-col transition-transform duration-300 shrink-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="p-5 border-b border-gray-800">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span class="text-sm">⚡</span>
          </div>
          <div>
            <h1 class="text-white font-bold text-sm">Admin Dashboard</h1>
            <p class="text-gray-500 text-xs">Portfolio Manager</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="navigate(tab.id)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left',
            activeTab === tab.id
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
          ]"
        >
          <span class="text-base leading-none">{{ tab.emoji }}</span>
          <span class="flex-1">{{ tab.label }}</span>
          <span
            v-if="tab.badge?.value"
            class="min-w-[1.25rem] h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center px-1"
          >
            {{ tab.badge.value }}
          </span>
        </button>
      </nav>

      <!-- Footer -->
      <div class="p-3 border-t border-gray-800 space-y-1">
        <a
          :href="auth.username ? `/${auth.username}` : '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span class="flex-1 truncate">
            <span v-if="auth.username" class="font-mono text-purple-400 text-xs">/{{ auth.username }}</span>
            <span v-else>View Live Portfolio</span>
          </span>
        </a>
        <button
          @click="auth.signOut()"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg text-sm transition-colors"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="shrink-0 bg-white border-b border-gray-200 px-5 py-3.5 flex items-center gap-4">
        <!-- Mobile hamburger -->
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h2 class="font-semibold text-gray-900">{{ currentTab?.label }}</h2>
          <p class="text-xs text-gray-400 hidden sm:block">
            Manage your portfolio — changes are saved to the cloud.
          </p>
        </div>

        <!-- Live badge + user email -->
        <div class="ml-auto flex items-center gap-3">
          <span class="hidden sm:block text-xs text-gray-400 truncate max-w-[160px]">
            {{ auth.user?.email }}
          </span>
          <div class="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </div>
        </div>
      </header>

      <!-- DB cold-start retry banner (shown across all tabs) -->
      <div
        v-if="store.retrying"
        class="shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-amber-700 text-sm"
      >
        <svg class="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Database is waking up — retrying automatically...
      </div>

      <!-- Panel content -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-8">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component :is="currentComponent" :key="activeTab" />
        </Transition>
      </div>
    </main>
  </div>
</template>
