<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import NavBar from '@/components/portfolio/NavBar.vue'
import HeroSection from '@/components/portfolio/HeroSection.vue'
import AchievementsSection from '@/components/portfolio/AchievementsSection.vue'
import ProjectsSection from '@/components/portfolio/ProjectsSection.vue'
import InquirySection from '@/components/portfolio/InquirySection.vue'
import FooterSection from '@/components/portfolio/FooterSection.vue'

const route = useRoute()
const store = usePortfolioStore()

onMounted(() => store.fetchByUsername(route.params.username))
</script>

<template>
  <!-- Loading -->
  <div v-if="store.loading" class="min-h-screen bg-gray-950 flex items-center justify-center">
    <svg class="w-8 h-8 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  </div>

  <!-- Not found -->
  <div v-else-if="store.notFound" class="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-4">
    <p class="text-7xl mb-4">🔍</p>
    <h1 class="text-3xl font-bold text-white mb-2">Portfolio not found</h1>
    <p class="text-gray-500 mb-6">
      <span class="text-purple-400 font-mono">{{ route.params.username }}</span>
      doesn't exist yet.
    </p>
    <a href="/" class="text-purple-400 hover:text-purple-300 text-sm underline underline-offset-4 transition-colors">
      Back to home
    </a>
  </div>

  <!-- Portfolio -->
  <div v-else class="bg-gray-950 min-h-screen">
    <NavBar />
    <HeroSection />
    <AchievementsSection />
    <ProjectsSection />
    <InquirySection />
    <FooterSection />
  </div>
</template>
