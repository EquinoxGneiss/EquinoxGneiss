<script setup>
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

function scrollDown() {
  document.getElementById('achievements')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section
    id="hero"
    class="tmct-bg-primary relative min-h-screen flex items-center justify-center overflow-hidden"
  >
    <!-- Animated background orbs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        class="tmct-orb-1 absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-slow"
      ></div>
      <div
        class="tmct-orb-2 absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-slow"
        style="animation-delay: 2s"
      ></div>
      <div
        class="tmct-orb-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-50"
      ></div>
    </div>

    <!-- Subtle grid (dark/glass only — blend-mode keeps it invisible on light themes) -->
    <div
      class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-60"
    ></div>

    <!-- Content -->
    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center py-32">
      <!-- Avatar -->
      <div class="mb-10 flex justify-center animate-fade-in">
        <div class="relative">
          <div
            class="absolute inset-0 rounded-full blur-xl opacity-50 scale-110"
            style="background: linear-gradient(to right, var(--accent), var(--accent-2))"
          ></div>
          <img
            v-if="store.hero.avatar"
            :src="store.hero.avatar"
            :alt="store.hero.name"
            class="relative w-32 h-32 rounded-full object-cover border-2 ring-4"
            style="border-color: color-mix(in srgb, var(--accent) 40%, transparent); ring-color: color-mix(in srgb, var(--accent) 20%, transparent)"
          />
          <div
            v-else
            class="relative w-32 h-32 rounded-full flex items-center justify-center border-2 ring-4"
            style="background: linear-gradient(to bottom right, var(--accent), var(--accent-2)); border-color: color-mix(in srgb, var(--accent) 40%, transparent)"
          >
            <span class="text-5xl font-bold text-white select-none">
              {{ (store.hero.name || 'P').charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Name -->
      <h1 class="tmct-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 animate-slide-up">
        <span class="tmct-gradient-text leading-tight">
          {{ store.hero.name || 'Your Name' }}
        </span>
      </h1>

      <!-- Title -->
      <p
        class="tmct-text-muted text-xl sm:text-2xl font-medium mb-10 animate-slide-up"
        style="animation-delay: 0.1s"
      >
        {{ store.hero.title || 'Your Professional Title' }}
      </p>

      <!-- Quote block -->
      <div class="relative max-w-2xl mx-auto mb-10 animate-fade-in" style="animation-delay: 0.2s">
        <span
          class="tmct-accent absolute -top-6 -left-2 text-7xl font-serif leading-none select-none opacity-25"
        >"</span>
        <blockquote class="tmct-text-primary text-lg sm:text-xl font-light italic leading-relaxed px-8 opacity-90">
          {{ store.hero.quote || 'Your inspiring quote goes here.' }}
        </blockquote>
        <span
          class="tmct-accent absolute -bottom-10 -right-2 text-7xl font-serif leading-none select-none opacity-25"
        >"</span>
      </div>

      <!-- Bio -->
      <p
        v-if="store.hero.bio"
        class="tmct-text-muted text-base sm:text-lg max-w-xl mx-auto mt-8 leading-relaxed animate-fade-in"
        style="animation-delay: 0.3s"
      >
        {{ store.hero.bio }}
      </p>

      <!-- Scroll down -->
      <button
        @click="scrollDown"
        class="tmct-text-subtle mt-16 inline-flex flex-col items-center gap-2 transition-colors group"
        style="transition: color 0.2s"
        @mouseenter="(e) => e.currentTarget.style.color = 'var(--accent)'"
        @mouseleave="(e) => e.currentTarget.style.color = ''"
        aria-label="Scroll down"
      >
        <span class="text-xs font-medium uppercase tracking-widest">Scroll</span>
        <svg class="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </section>
</template>

