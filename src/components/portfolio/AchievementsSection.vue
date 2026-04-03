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
  <section id="achievements" class="py-24 bg-gray-950" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16 section-fade">
        <p class="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
          Milestones
        </p>
        <h2 class="text-4xl sm:text-5xl font-extrabold text-white mb-4">Achievements</h2>
        <div
          class="w-16 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full"
        ></div>
        <p class="text-gray-500 mt-5 max-w-xl mx-auto">
          Recognitions and milestones that define the journey.
        </p>
      </div>

      <!-- Empty state -->
      <div
        v-if="!store.achievements.length"
        class="text-center py-24 section-fade"
      >
        <div class="text-6xl mb-4 opacity-30">🏆</div>
        <p class="text-gray-600">No achievements added yet.</p>
      </div>

      <!-- Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="(item, i) in store.achievements"
          :key="item.id"
          class="group relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20 section-fade"
          :style="{ transitionDelay: `${i * 0.08}s` }"
        >
          <!-- Image -->
          <div class="relative h-52 overflow-hidden bg-gray-800">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-indigo-900/40"
            >
              <span class="text-5xl opacity-40">🏆</span>
            </div>
            <!-- Date badge -->
            <div
              v-if="item.date"
              class="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-500/30"
            >
              {{ item.date }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3
              class="text-white font-semibold text-lg mb-2 group-hover:text-purple-300 transition-colors line-clamp-1"
            >
              {{ item.title }}
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed line-clamp-3">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
