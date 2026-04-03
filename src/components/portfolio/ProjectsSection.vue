<script setup>
import { ref, onMounted } from 'vue'
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
  <section id="projects" class="tmct-bg-secondary py-24" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16 section-fade">
        <p class="tmct-accent-2 tmct-section-label text-sm font-semibold uppercase tracking-widest mb-3">
          Portfolio
        </p>
        <h2 class="tmct-heading tmct-text-primary text-4xl sm:text-5xl font-extrabold mb-4">Projects</h2>
        <div class="tmct-divider-bar w-16 h-1 mx-auto rounded-full"></div>
        <p class="tmct-text-muted mt-5 max-w-xl mx-auto">
          Things I've built — from concept to production.
        </p>
      </div>

      <!-- Empty state -->
      <div v-if="!store.projects.length" class="text-center py-24 section-fade">
        <div class="text-6xl mb-4 opacity-30">💻</div>
        <p class="tmct-text-subtle">No projects added yet.</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(project, i) in store.projects"
          :key="project.id"
          class="tmct-card group relative overflow-hidden hover:-translate-y-1 transition-all duration-300 section-fade"
          :style="{ transitionDelay: `${i * 0.08}s` }"
        >
          <!-- Image / Code Preview -->
          <div class="relative h-52 overflow-hidden">
            <img
              v-if="project.image"
              :src="project.image"
              :alt="project.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <!-- Code-style placeholder -->
            <div
              v-else
              class="tmct-bg-primary w-full h-full p-5 font-mono overflow-hidden"
            >
              <div class="flex items-center gap-1.5 mb-4">
                <div class="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/60"></div>
                <span class="ml-2 text-xs tmct-text-subtle">project.js</span>
              </div>
              <pre class="text-xs leading-relaxed tmct-text-muted overflow-hidden"><span class="tmct-accent">const</span> <span class="tmct-accent-2">{{ project.title.replace(/\s+/g, '_').toLowerCase() }}</span> = {
  name: <span class="tmct-accent">"{{ project.title }}"</span>,
  status: "shipped",
  stack: [{{ (project.tech || []).slice(0,2).map(t => `"${t}"`).join(', ') }}]
}</pre>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3
              class="tmct-heading tmct-text-primary font-semibold text-xl mb-2 transition-colors"
              style="transition: color 0.2s"
              @mouseenter="(e) => e.currentTarget.style.color = 'var(--accent-2)'"
              @mouseleave="(e) => e.currentTarget.style.color = ''"
            >
              {{ project.title }}
            </h3>
            <p class="tmct-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
              {{ project.description }}
            </p>

            <!-- Tech tags -->
            <div v-if="project.tech?.length" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in project.tech"
                :key="tag"
                class="tmct-tag text-xs px-2.5 py-1 rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Links -->
            <div class="flex gap-2 flex-wrap">
              <a
                v-if="project.live_url"
                :href="project.live_url"
                target="_blank"
                rel="noopener noreferrer"
                class="tmct-btn inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Demo
              </a>
              <a
                v-if="project.github_url"
                :href="project.github_url"
                target="_blank"
                rel="noopener noreferrer"
                class="tmct-btn inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

