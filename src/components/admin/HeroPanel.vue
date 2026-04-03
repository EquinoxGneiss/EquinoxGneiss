<script setup>
import { ref, watch } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

const form = ref({ ...store.hero })
const saved = ref(false)
const saving = ref(false)
const saveError = ref('')
const avatarError = ref(false)

// Upload state
const uploading = ref(false)
const uploadError = ref('')
const uploadProgress = ref(0)
const dragOver = ref(false)
const avatarMode = ref('url') // 'url' | 'upload'
const fileInput = ref(null)

watch(
  () => store.hero,
  (val) => { form.value = { ...val } }
)

function handleAvatarLoad() { avatarError.value = false }
function handleAvatarError() { avatarError.value = true }

// Resize image to max 400×400 via canvas before uploading
function resizeImage(file, maxPx = 400) {
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
    const url = await store.uploadAvatar(resized)
    uploadProgress.value = 90
    form.value.avatar = url
    avatarError.value = false
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
  saving.value = true
  saveError.value = ''
  try {
    await store.updateHero({ ...form.value })
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    saveError.value = e.message === 'timeout'
      ? 'Database is waking up — please try again in a moment.'
      : (e.message || 'Failed to save.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <!-- Avatar section -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>

        <div class="flex items-start gap-5">
          <!-- Preview -->
          <div class="shrink-0">
            <img
              v-if="form.avatar && !avatarError"
              :src="form.avatar"
              @load="handleAvatarLoad"
              @error="handleAvatarError"
              alt="Avatar preview"
              class="w-20 h-20 rounded-full object-cover border-2 border-purple-200 shadow-sm"
            />
            <div
              v-else
              class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-200 flex items-center justify-center"
            >
              <span class="text-2xl font-bold text-purple-500">
                {{ (form.name || 'P').charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex-1 min-w-0 space-y-3">
            <!-- Mode tabs -->
            <div class="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 w-fit gap-0.5">
              <button
                type="button"
                @click="avatarMode = 'upload'"
                :class="avatarMode === 'upload'
                  ? 'bg-white text-purple-700 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 text-xs rounded-md transition-all"
              >
                Upload Photo
              </button>
              <button
                type="button"
                @click="avatarMode = 'url'"
                :class="avatarMode === 'url'
                  ? 'bg-white text-purple-700 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-3 py-1.5 text-xs rounded-md transition-all"
              >
                Paste URL
              </button>
            </div>

            <!-- Upload panel -->
            <div v-if="avatarMode === 'upload'">
              <!-- Drop zone -->
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
                  <!-- Progress bar -->
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
                  <p class="text-xs text-gray-400">JPG, PNG, WebP, GIF · Recommended <strong>400×400 px</strong> · Max 10 MB</p>
                  <p class="text-xs text-gray-400">Photos are automatically resized to 400×400</p>
                </div>
              </div>
              <p v-if="uploadError" class="text-red-500 text-xs mt-1.5">{{ uploadError }}</p>
            </div>

            <!-- URL panel -->
            <div v-else>
              <input
                v-model="form.avatar"
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <p class="text-xs text-gray-400 mt-1">Paste a direct image URL. Leave blank to show your initials.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-400">*</span></label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Your full name"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. Full-Stack Developer"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Personal Quote / Message</label>
        <textarea
          v-model="form.quote"
          rows="2"
          placeholder="An inspiring quote or personal message..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">{{ form.quote?.length ?? 0 }} characters</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
        <textarea
          v-model="form.bio"
          rows="3"
          placeholder="A brief description about yourself..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
        ></textarea>
        <p class="text-xs text-gray-400 mt-1">{{ form.bio?.length ?? 0 }} characters</p>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          @click="save"
          :disabled="saving"
          class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <span v-if="saved" class="text-green-600 text-sm flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Saved!
          </span>
          <span v-else-if="saveError" class="text-red-500 text-sm">{{ saveError }}</span>
        </Transition>
      </div>
    </div>
  </div>
</template>
