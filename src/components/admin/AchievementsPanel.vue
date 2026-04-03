<script setup>
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

const showForm = ref(false)
const editingId = ref(null)
const saveError = ref('')

// Upload state
const imageMode = ref('url') // 'url' | 'upload'
const uploading = ref(false)
const uploadError = ref('')
const uploadProgress = ref(0)
const dragOver = ref(false)
const fileInput = ref(null)

function emptyForm() {
  return {
    title: '',
    description: '',
    image: '',
    date: String(new Date().getFullYear()),
  }
}

const form = ref(emptyForm())

function openAdd() {
  editingId.value = null
  form.value = emptyForm()
  saveError.value = ''
  imageMode.value = 'url'
  uploadError.value = ''
  showForm.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = { ...item }
  saveError.value = ''
  imageMode.value = 'url'
  uploadError.value = ''
  showForm.value = true
}

function cancel() {
  showForm.value = false
  editingId.value = null
  form.value = emptyForm()
  saveError.value = ''
  imageMode.value = 'url'
  uploadError.value = ''
}

// Resize image to max 800×800 via canvas before uploading
function resizeImage(file, maxPx = 800) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.88)
    }
    img.src = url
  })
}

async function handleFile(file) {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select an image file (JPG, PNG, WebP, GIF).'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    uploadError.value = 'File must be under 10 MB.'
    return
  }
  uploading.value = true
  uploadError.value = ''
  uploadProgress.value = 10
  try {
    const resized = await resizeImage(file)
    uploadProgress.value = 40
    const url = await store.uploadImage(resized, 'achievements')
    uploadProgress.value = 90
    form.value.image = url
    uploadProgress.value = 100
    setTimeout(() => { uploadProgress.value = 0 }, 800)
  } catch (e) {
    uploadError.value = e.message || 'Upload failed. Please try again.'
    uploadProgress.value = 0
  } finally {
    uploading.value = false
  }
}

function onFileInput(e) { handleFile(e.target.files[0]) }
function onDrop(e) {
  dragOver.value = false
  handleFile(e.dataTransfer.files[0])
}

async function save() {
  if (!form.value.title.trim()) return
  saveError.value = ''
  try {
    if (editingId.value) {
      await store.updateAchievement(editingId.value, form.value)
    } else {
      await store.addAchievement(form.value)
    }
    cancel()
  } catch (e) {
    saveError.value = e.message === 'timeout'
      ? 'Database is waking up — please try again in a moment.'
      : (e.message || 'Failed to save.')
  }
}

async function remove(id) {
  if (!confirm('Delete this achievement?')) return
  try {
    await store.deleteAchievement(id)
  } catch (e) {
    alert('Delete failed: ' + (e.message === 'timeout' ? 'Database is waking up — please try again.' : e.message))
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-5">
    <!-- Add button -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        {{ store.achievements.length }} achievement{{ store.achievements.length !== 1 ? 's' : '' }}
      </p>
      <button
        @click="openAdd"
        class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Achievement
      </button>
    </div>

    <!-- Form -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="showForm" class="bg-white rounded-xl border border-purple-200 p-6 shadow-sm space-y-4">
        <h3 class="font-semibold text-gray-800">
          {{ editingId ? 'Edit Achievement' : 'New Achievement' }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-400">*</span></label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Award name or achievement"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Year / Date</label>
            <input
              v-model="form.date"
              type="text"
              placeholder="2025"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Brief description of the achievement..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Achievement Image</label>

          <!-- Mode tabs -->
          <div class="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 w-fit gap-0.5 mb-3">
            <button
              type="button"
              @click="imageMode = 'upload'"
              :class="imageMode === 'upload'
                ? 'bg-white text-purple-700 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-700'"
              class="px-3 py-1.5 text-xs rounded-md transition-all"
            >
              Upload Image
            </button>
            <button
              type="button"
              @click="imageMode = 'url'"
              :class="imageMode === 'url'
                ? 'bg-white text-purple-700 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-700'"
              class="px-3 py-1.5 text-xs rounded-md transition-all"
            >
              Paste URL
            </button>
          </div>

          <!-- Upload panel -->
          <div v-if="imageMode === 'upload'">
            <div
              @dragover.prevent="dragOver = true"
              @dragleave.prevent="dragOver = false"
              @drop.prevent="onDrop"
              @click="fileInput.click()"
              :class="[
                'relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors select-none',
                dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50',
                uploading ? 'pointer-events-none opacity-60' : '',
              ]"
            >
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInput" />
              <div v-if="uploading" class="flex flex-col items-center gap-2">
                <svg class="w-6 h-6 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span class="text-xs text-gray-500">Uploading…</span>
                <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div
                    class="h-full bg-purple-500 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
              </div>
              <div v-else class="flex flex-col items-center gap-1.5">
                <svg class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p class="text-sm text-gray-600">
                  <span class="text-purple-600 font-medium">Click to upload</span>
                  <span class="text-gray-400"> or drag & drop</span>
                </p>
                <p class="text-xs text-gray-400">JPG, PNG, WebP, GIF · Max 10 MB · Auto-resized to 800 px</p>
              </div>
            </div>
            <p v-if="uploadError" class="text-red-500 text-xs mt-1.5">{{ uploadError }}</p>
          </div>

          <!-- URL panel -->
          <div v-else>
            <input
              v-model="form.image"
              type="url"
              placeholder="https://example.com/achievement-photo.jpg"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          <!-- Preview -->
          <img
            v-if="form.image"
            :src="form.image"
            alt="Preview"
            class="mt-2 h-24 rounded-lg object-cover border border-gray-200"
            @error="(e) => e.target.style.display = 'none'"
          />
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="save"
            :disabled="!form.title.trim()"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
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
      v-if="!store.achievements.length"
      class="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center"
    >
      <div class="text-4xl mb-3 opacity-40">🏆</div>
      <p class="text-gray-500 text-sm">No achievements yet. Click "Add Achievement" to get started.</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in store.achievements"
        :key="item.id"
        class="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start hover:border-purple-200 transition-colors"
      >
        <!-- Thumb -->
        <div class="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover"
            @error="(e) => e.target.parentElement.innerHTML = '<span class=\'flex items-center justify-center h-full text-2xl\'>🏆</span>'"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-2xl">🏆</div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="font-medium text-gray-900 truncate">{{ item.title }}</h4>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.date }}</p>
              <p v-if="item.description" class="text-sm text-gray-500 mt-1 line-clamp-1">
                {{ item.description }}
              </p>
            </div>
            <div class="flex gap-1 shrink-0">
              <button
                @click="openEdit(item)"
                class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="remove(item.id)"
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
