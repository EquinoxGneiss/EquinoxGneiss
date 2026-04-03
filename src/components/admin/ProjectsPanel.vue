<script setup>
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

const showForm = ref(false)
const editingId = ref(null)
const techInput = ref('')
const saveError = ref('')

function emptyForm() {
  return {
    title: '',
    description: '',
    image: '',
    live_url: '',
    github_url: '',
    tech: [],
  }
}

const form = ref(emptyForm())

function openAdd() {
  editingId.value = null
  form.value = emptyForm()
  techInput.value = ''
  saveError.value = ''
  showForm.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item, tech: [...(item.tech || [])] }
  techInput.value = (item.tech || []).join(', ')
  saveError.value = ''
  showForm.value = true
}

function cancel() {
  showForm.value = false
  editingId.value = null
  form.value = emptyForm()
  techInput.value = ''
  saveError.value = ''
}

async function save() {
  if (!form.value.title.trim()) return
  saveError.value = ''
  const tech = techInput.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
  const data = { ...form.value, tech }

  try {
    if (editingId.value) {
      await store.updateProject(editingId.value, data)
    } else {
      await store.addProject(data)
    }
    cancel()
  } catch (e) {
    saveError.value = e.message === 'timeout'
      ? 'Database is waking up — please try again in a moment.'
      : (e.message || 'Failed to save.')
  }
}

async function remove(id) {
  if (!confirm('Delete this project?')) return
  try {
    await store.deleteProject(id)
  } catch (e) {
    alert('Delete failed: ' + (e.message === 'timeout' ? 'Database is waking up — please try again.' : e.message))
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        {{ store.projects.length }} project{{ store.projects.length !== 1 ? 's' : '' }}
      </p>
      <button
        @click="openAdd"
        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Project
      </button>
    </div>

    <!-- Form -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="showForm" class="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm space-y-4">
        <h3 class="font-semibold text-gray-800">
          {{ editingId ? 'Edit Project' : 'New Project' }}
        </h3>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Project Title <span class="text-red-400">*</span></label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. E-Commerce Platform"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe what this project does, its purpose, and impact..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tech Stack
            <span class="font-normal text-gray-400">(comma-separated)</span>
          </label>
          <input
            v-model="techInput"
            type="text"
            placeholder="Vue.js, Node.js, PostgreSQL, Tailwind CSS"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <!-- Tag preview -->
          <div v-if="techInput.trim()" class="flex flex-wrap gap-1.5 mt-2">
            <span
              v-for="tag in techInput.split(',').map(t => t.trim()).filter(Boolean)"
              :key="tag"
              class="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preview Image URL</label>
          <input
            v-model="form.image"
            type="url"
            placeholder="https://example.com/screenshot.jpg"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <img
            v-if="form.image"
            :src="form.image"
            alt="Preview"
            class="mt-2 h-24 rounded-lg object-cover border border-gray-200"
            @error="(e) => e.target.style.display = 'none'"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Live Demo URL</label>
            <input
              v-model="form.live_url"
              type="url"
              placeholder="https://yourproject.com"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input
              v-model="form.github_url"
              type="url"
              placeholder="https://github.com/you/repo"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <button
            @click="save"
            :disabled="!form.title.trim()"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {{ editingId ? 'Update' : 'Add' }}
          </button>
          <button
            @click="cancel"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <span v-if="saveError" class="text-red-500 text-sm">{{ saveError }}</span>
        </div>
      </div>
    </Transition>

    <!-- Empty state -->
    <div
      v-if="!store.projects.length"
      class="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center"
    >
      <div class="text-4xl mb-3 opacity-40">💻</div>
      <p class="text-gray-500 text-sm">No projects yet. Click "Add Project" to get started.</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="project in store.projects"
        :key="project.id"
        class="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start hover:border-indigo-200 transition-colors"
      >
        <!-- Thumb -->
        <div class="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          <img
            v-if="project.image"
            :src="project.image"
            :alt="project.title"
            class="w-full h-full object-cover"
            @error="(e) => e.target.parentElement.innerHTML = '<div class=\'flex items-center justify-center h-full text-2xl\'>💻</div>'"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-2xl">💻</div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h4 class="font-medium text-gray-900 truncate">{{ project.title }}</h4>
              <p v-if="project.description" class="text-sm text-gray-500 mt-0.5 line-clamp-1">
                {{ project.description }}
              </p>
              <!-- Tech tags -->
              <div v-if="project.tech?.length" class="flex flex-wrap gap-1 mt-1.5">
                <span
                  v-for="tag in project.tech.slice(0, 4)"
                  :key="tag"
                  class="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="project.tech.length > 4"
                  class="text-xs text-gray-400"
                >
                  +{{ project.tech.length - 4 }} more
                </span>
              </div>
            </div>
            <div class="flex gap-1 shrink-0">
              <button
                @click="openEdit(project)"
                class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="remove(project.id)"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
