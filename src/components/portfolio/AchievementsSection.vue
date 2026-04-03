<script setup>
import { onMounted, ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()
const sectionRef = ref(null)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    },
    { threshold: 0.1 }
  )
  sectionRef.value?.querySelectorAll('.section-fade').forEach((el) => observer.observe(el))
})
</script>

<template>
  <section id="achievements" class="tmct-bg-primary py-24" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16 section-fade">
        <p class="tmct-section-label text-sm font-semibold uppercase tracking-widest mb-3">
          Milestones
        </p>
        <h2 class="tmct-heading tmct-text-primary text-4xl sm:text-5xl font-extrabold mb-4">Achievements</h2>
        <div class="tmct-divider-bar w-16 h-1 mx-auto rounded-full"></div>
        <p class="tmct-text-muted mt-5 max-w-xl mx-auto">
          Recognitions and milestones that define the journey.
        </p>
      </div>

      <!-- Empty state -->
      <div v-if="!store.achievements.length" class="text-center py-24 section-fade">
        <div class="text-6xl mb-4 opacity-30">🏆</div>
        <p class="tmct-text-subtle">No achievements added yet.</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(item, i) in store.achievements"
          :key="item.id"
          class="tmct-card group relative overflow-hidden hover:-translate-y-1 transition-all duration-300 section-fade"
          :style="{ transitionDelay: `${i * 0.08}s` }"
        >
          <!-- Image -->
          <div class="relative h-52 overflow-hidden" style="background-color: var(--bg-secondary)">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              v-else
              class="tmct-orb-1 w-full h-full flex items-center justify-center"
            >
              <span class="text-5xl opacity-40">🏆</span>
            </div>
            <!-- Date badge -->
            <div
              v-if="item.date"
              class="tmct-tag absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              {{ item.date }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3
              class="tmct-heading tmct-text-primary font-semibold text-lg mb-2 line-clamp-1 transition-colors"
              style="transition: color 0.2s"
              @mouseenter="(e) => e.currentTarget.style.color = 'var(--accent)'"
              @mouseleave="(e) => e.currentTarget.style.color = ''"
            >
              {{ item.title }}
            </h3>
            <p class="tmct-text-muted text-sm leading-relaxed line-clamp-3">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

