<script setup>
import { ref, computed, markRaw, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore } from '@/stores/auth'
import { getProfession, professions } from '@/lib/professions'
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
const router = useRouter()

onMounted(async () => {
  await auth.init()
  // Auth is now resolved — fetch portfolio data for the signed-in user.
  if (auth.user) {
    await store.fetchForOwner(auth.user.id)
    // Guard: if profession is not set, send to onboarding
    if (!store.profession) {
      router.replace('/onboarding')
    }
  }
})

// Also re-fetch when sign-in happens mid-session (e.g. from LoginPanel).
watch(
  () => auth.user,
  async (newUser) => {
    if (newUser) {
      await store.fetchForOwner(newUser.id)
      if (!store.profession) router.replace('/onboarding')
    }
  },
)

// — Change Profession modal —
const showProfessionModal = ref(false)
const changingTo = ref(null)
const changeSaving = ref(false)
const changeError = ref('')

async function saveProfessionChange() {
  if (!changingTo.value) return
  changeSaving.value = true
  changeError.value = ''
  try {
    await store.updateProfession(changingTo.value)
    showProfessionModal.value = false
  } catch (e) {
    changeError.value = e.message || 'Failed to save.'
  } finally {
    changeSaving.value = false
  }
}

const currentProfession = computed(() => getProfession(store.profession))

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
        <!-- Profession badge + change link -->
        <div v-if="currentProfession" class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-sm leading-none">{{ currentProfession.icon }}</span>
            <span class="text-xs text-purple-300 font-medium">{{ currentProfession.label }}</span>
          </div>
          <button
            @click="showProfessionModal = true; changingTo = store.profession"
            class="text-xs text-gray-600 hover:text-purple-400 transition-colors"
          >Change</button>
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

      <!-- Retry banner (shown across all tabs — covers cold-start and stale-connection) -->
      <div
        v-if="store.retrying"
        class="shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-amber-700 text-sm"
      >
        <svg class="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Reconnecting — retrying automatically...
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

  <!-- Change Profession modal -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showProfessionModal"
      class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-8"
      @click.self="showProfessionModal = false"
    >
      <div class="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div class="flex items-start justify-between mb-5">
          <div>
            <h2 class="text-white font-bold text-lg">Change Profession</h2>
            <p class="text-gray-500 text-xs mt-1">Changing profession only affects the admin form labels and your portfolio layout — your existing entries are not deleted.</p>
          </div>
          <button @click="showProfessionModal = false" class="text-gray-600 hover:text-white text-xl leading-none ml-4">&times;</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          <button
            v-for="p in professions"
            :key="p.id"
            @click="changingTo = p.id"
            :class="[
              'text-left rounded-xl border p-4 transition-all',
              changingTo === p.id
                ? 'border-purple-500 bg-purple-950/50 ring-1 ring-purple-500'
                : 'border-gray-800 bg-gray-800/50 hover:border-gray-600',
            ]"
          >
            <div class="text-2xl mb-1.5">{{ p.icon }}</div>
            <div class="text-white text-sm font-medium">{{ p.label }}</div>
            <div class="text-gray-500 text-xs mt-0.5">{{ p.description }}</div>
          </button>
        </div>

        <p v-if="changeError" class="text-red-400 text-sm mb-3">{{ changeError }}</p>

        <div class="flex gap-3">
          <button
            @click="saveProfessionChange"
            :disabled="changeSaving || changingTo === store.profession"
            class="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <span v-if="changeSaving">Saving…</span>
            <span v-else>Save Change</span>
          </button>
          <button
            @click="showProfessionModal = false"
            class="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >Cancel</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
