<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()
const scrolled = ref(false)
const menuOpen = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 60
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const navLinks = [
  { label: 'About', id: 'hero' },
  { label: 'Achievements', id: 'achievements' },
  { label: 'Projects', id: 'projects' },
  { label: 'Contact', id: 'contact' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  menuOpen.value = false
}
</script>

<template>
  <nav
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-gray-950/95 backdrop-blur-md shadow-xl shadow-black/30 border-b border-gray-800/60'
        : 'bg-transparent',
    ]"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand -->
        <button
          @click="scrollTo('hero')"
          class="font-bold text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
        >
          {{ store.hero.name || 'Portfolio' }}
        </button>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-8">
          <button
            v-for="link in navLinks"
            :key="link.id"
            @click="scrollTo(link.id)"
            class="text-gray-400 hover:text-purple-400 text-sm font-medium transition-colors duration-200"
          >
            {{ link.label }}
          </button>
        </div>

        <!-- Mobile hamburger -->
        <button
          @click="menuOpen = !menuOpen"
          class="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="menuOpen"
        class="md:hidden bg-gray-950/98 backdrop-blur-md border-t border-gray-800"
      >
        <div class="px-4 py-4 space-y-1">
          <button
            v-for="link in navLinks"
            :key="link.id"
            @click="scrollTo(link.id)"
            class="block w-full text-left px-3 py-2.5 text-gray-300 hover:text-purple-400 hover:bg-gray-900 rounded-lg text-sm transition-colors"
          >
            {{ link.label }}
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>
