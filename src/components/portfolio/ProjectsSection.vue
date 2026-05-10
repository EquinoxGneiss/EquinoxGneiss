<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { getProfession } from '@/lib/professions'

const store = usePortfolioStore()
const sectionRef = ref(null)

const prof = computed(() => getProfession(store.profession))
const tagsField = computed(() => prof.value.fields.find((f) => f.type === 'tags') ?? null)
const urlFields = computed(() => prof.value.fields.filter((f) => f.type === 'url'))
const textFields = computed(() => prof.value.fields.filter((f) => f.type === 'text'))

function getTags(project) {
  if (!tagsField.value) return []
  const fromDetails = project.details?.[tagsField.value.key]
  if (Array.isArray(fromDetails) && fromDetails.length) return fromDetails
  // Backward compat: developer projects stored in root tech column
  if (prof.value.id === 'developer' && project.tech?.length) return project.tech
  return []
}

function getPrimaryUrl(project) {
  for (const f of urlFields.value) {
    const val = project.details?.[f.key] || (f.key === 'live_url' ? project.live_url : '') || (f.key === 'github_url' ? project.github_url : '')
    if (val) return { label: f.label, url: val, key: f.key }
  }
  return null
}

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
          {{ prof.sectionLabel }}
        </p>
        <h2 class="tmct-heading tmct-text-primary text-4xl sm:text-5xl font-extrabold mb-4">{{ prof.sectionLabel }}</h2>
        <div class="tmct-divider-bar w-16 h-1 mx-auto rounded-full"></div>
        <p class="tmct-text-muted mt-5 max-w-xl mx-auto">
          {{
            prof.id === 'developer' ? "Things I've built — from concept to production." :
            prof.id === 'designer'  ? "Creative work I've designed — from concept to delivery." :
            prof.id === 'accountant'? "Financial solutions and results I've delivered for clients." :
            prof.id === 'teacher'   ? "Lessons, materials, and programs I've developed." :
            prof.id === 'engineer'  ? "Projects I've designed, built, and delivered." :
            prof.id === 'marketing' ? "Campaigns I've created and the results they achieved." :
            prof.id === 'nurse'     ? "Clinical experiences and patient care highlights." :
            prof.id === 'doctor'    ? "Clinical cases, research, and professional contributions." :
            "Selected work from my professional portfolio."
          }}
        </p>
      </div>

      <!-- Empty state -->
      <div v-if="!store.projects.length" class="text-center py-24 section-fade">
        <div class="text-6xl mb-4 opacity-30">{{ prof.placeholderIcon }}</div>
        <p class="tmct-text-subtle">No {{ prof.projectLabelPlural.toLowerCase() }} added yet.</p>
      </div>

      <!-- ── Developer / Designer: image card layout ── -->
      <div v-else-if="prof.showImage" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(project, i) in store.projects"
          :key="project.id"
          class="tmct-card group relative overflow-hidden hover:-translate-y-1 transition-all duration-300 section-fade"
          :style="{ transitionDelay: `${i * 0.08}s` }"
        >
          <!-- Image / Code Placeholder -->
          <div class="relative h-52 overflow-hidden">
            <img
              v-if="project.image"
              :src="project.image"
              :alt="project.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="tmct-bg-primary w-full h-full p-5 font-mono overflow-hidden">
              <div class="flex items-center gap-1.5 mb-4">
                <div class="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div class="w-3 h-3 rounded-full bg-green-500/60"></div>
                <span class="ml-2 text-xs tmct-text-subtle">{{ prof.id === 'designer' ? 'design.fig' : 'project.js' }}</span>
              </div>
              <pre class="text-xs leading-relaxed tmct-text-muted overflow-hidden"><span class="tmct-accent">const</span> <span class="tmct-accent-2">{{ project.title.replace(/\s+/g, '_').toLowerCase() }}</span> = {
  name: <span class="tmct-accent">"{{ project.title }}"</span>,
  status: "shipped",
  stack: [{{ getTags(project).slice(0,2).map(t => `"${t}"`).join(', ') }}]
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

            <!-- Tags (tech / tools) -->
            <div v-if="getTags(project).length" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in getTags(project)"
                :key="tag"
                class="tmct-tag text-xs px-2.5 py-1 rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Links -->
            <div class="flex gap-2 flex-wrap">
              <a
                v-if="project.details?.live_url || project.live_url"
                :href="project.details?.live_url || project.live_url"
                target="_blank" rel="noopener noreferrer"
                class="tmct-btn inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {{ prof.id === 'designer' ? 'Preview' : 'Live Demo' }}
              </a>
              <a
                v-if="project.details?.github_url || project.github_url"
                :href="project.details?.github_url || project.github_url"
                target="_blank" rel="noopener noreferrer"
                class="tmct-btn inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
              <a
                v-if="prof.id === 'designer' && (project.details?.behance_url)"
                :href="project.details.behance_url"
                target="_blank" rel="noopener noreferrer"
                class="tmct-btn inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.726zm-7.726-3h3.scandards c-.088-1.372-1.108-1.982-1.995-1.982-.954 0-1.824.578-2.005 1.982z"/>
                </svg>
                Behance
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ── All other professions: text-first compact card layout ── -->
      <div v-else class="space-y-4">
        <div
          v-for="(project, i) in store.projects"
          :key="project.id"
          class="tmct-card section-fade p-5 sm:p-6 hover:-translate-y-0.5 transition-all duration-200"
          :style="{ transitionDelay: `${i * 0.06}s` }"
        >
          <div class="flex gap-4 items-start">
            <!-- Icon badge -->
            <div class="shrink-0 w-11 h-11 rounded-xl tmct-bg-primary border border-opacity-10 flex items-center justify-center text-xl mt-0.5">
              {{ prof.placeholderIcon }}
            </div>

            <div class="flex-1 min-w-0">
              <!-- Title + link -->
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <h3
                  class="tmct-heading tmct-text-primary font-semibold text-lg leading-snug"
                  style="transition: color 0.2s"
                  @mouseenter="(e) => e.currentTarget.style.color = 'var(--accent-2)'"
                  @mouseleave="(e) => e.currentTarget.style.color = ''"
                >
                  {{ project.title }}
                </h3>
                <!-- Primary link button (reference, resource, live url) -->
                <a
                  v-if="getPrimaryUrl(project)"
                  :href="getPrimaryUrl(project).url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tmct-btn inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg shrink-0"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View
                </a>
              </div>

              <!-- Description -->
              <p v-if="project.description" class="tmct-text-muted text-sm leading-relaxed mt-1.5 mb-3">
                {{ project.description }}
              </p>

              <!-- Profession-specific detail pills (text fields) -->
              <div v-if="textFields.length" class="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
                <div
                  v-for="f in textFields"
                  :key="f.key"
                  class="flex items-center gap-1.5"
                >
                  <span v-if="project.details?.[f.key]" class="text-xs tmct-text-subtle">
                    <span class="tmct-text-muted font-medium">{{ f.label }}:</span>
                    {{ project.details[f.key] }}
                  </span>
                </div>
              </div>

              <!-- Tags pills (skills / services / channels / tools) -->
              <div v-if="getTags(project).length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in getTags(project)"
                  :key="tag"
                  class="tmct-tag text-xs px-2.5 py-1 rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

