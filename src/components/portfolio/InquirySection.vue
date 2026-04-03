<script setup>
import { ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const store = usePortfolioStore()

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')
const errors = ref({})

function validate() {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = 'Name is required.'
  else if (form.value.name.length > 100) errors.value.name = 'Name must be under 100 characters.'
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Enter a valid email address.'
  }
  if (!form.value.message.trim()) errors.value.message = 'Message is required.'
  else if (form.value.message.length > 5000) errors.value.message = 'Message must be under 5,000 characters.'
  return Object.keys(errors.value).length === 0
}

// Strip null bytes and non-printable ASCII control characters (except newlines/tabs)
// from a string. These cannot cause SQL injection via parameterized queries but
// null bytes silently truncate strings in PostgreSQL and control chars are garbage.
function sanitize(str) {
  return (str ?? '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

async function submitForm() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''
  const payload = {
    name:    sanitize(form.value.name),
    email:   sanitize(form.value.email),
    subject: sanitize(form.value.subject),
    message: sanitize(form.value.message),
  }
  try {
    await store.addInquiry(payload)
    form.value = { name: '', email: '', subject: '', message: '' }
    submitted.value = true
    setTimeout(() => (submitted.value = false), 6000)
  } catch (e) {
    submitError.value = 'Failed to send message. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section id="contact" class="tmct-bg-primary py-24">
    <div class="max-w-2xl mx-auto px-4 sm:px-6">
      <!-- Header -->
      <div class="text-center mb-14">
        <p class="tmct-section-label text-sm font-semibold uppercase tracking-widest mb-3">
          Say Hello
        </p>
        <h2 class="tmct-heading tmct-text-primary text-4xl sm:text-5xl font-extrabold mb-4">Get In Touch</h2>
        <div class="tmct-divider-bar w-16 h-1 mx-auto rounded-full"></div>
        <p class="tmct-text-muted mt-5">
          Have a question or want to collaborate? I'd love to hear from you.
        </p>
      </div>

      <!-- Success -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
      >
        <div
          v-if="submitted"
          class="mb-6 p-4 bg-green-950/60 border border-green-700/50 rounded-xl text-green-400 text-center text-sm"
        >
          ✓ Message sent successfully! I'll get back to you soon.
        </div>
      </Transition>

      <!-- Send error -->
      <div v-if="submitError" class="mb-6 p-4 bg-red-950/60 border border-red-700/50 rounded-xl text-red-400 text-center text-sm">
        {{ submitError }}
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" novalidate class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="tmct-text-muted block text-sm font-medium mb-1.5">Name <span class="tmct-accent">*</span></label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Your full name"
              maxlength="100"
              class="tmct-input w-full border rounded-xl px-4 py-3 text-sm transition"
              :class="errors.name ? 'border-red-500' : ''"
            />
            <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
          </div>
          <div>
            <label class="tmct-text-muted block text-sm font-medium mb-1.5">Email <span class="tmct-accent">*</span></label>
            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              maxlength="254"
              class="tmct-input w-full border rounded-xl px-4 py-3 text-sm transition"
              :class="errors.email ? 'border-red-500' : ''"
            />
            <p v-if="errors.email" class="text-red-400 text-xs mt-1">{{ errors.email }}</p>
          </div>
        </div>

        <div>
          <label class="tmct-text-muted block text-sm font-medium mb-1.5">Subject</label>
          <input
            v-model="form.subject"
            type="text"
            placeholder="What's this about?"
            maxlength="200"
            class="tmct-input w-full border rounded-xl px-4 py-3 text-sm transition"
          />
        </div>

        <div>
          <label class="tmct-text-muted block text-sm font-medium mb-1.5">Message <span class="tmct-accent">*</span></label>
          <textarea
            v-model="form.message"
            rows="5"
            placeholder="Write your message here..."
            maxlength="5000"
            class="tmct-input w-full border rounded-xl px-4 py-3 text-sm transition resize-none"
            :class="errors.message ? 'border-red-500' : ''"
          ></textarea>
          <p v-if="errors.message" class="text-red-400 text-xs mt-1">{{ errors.message }}</p>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-4 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white shadow-lg"
          style="background: linear-gradient(to right, var(--accent), var(--accent-2))"
        >
          <span v-if="submitting" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending...
          </span>
          <span v-else>Send Message</span>
        </button>
      </form>
    </div>
  </section>
</template>

