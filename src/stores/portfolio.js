import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'folio_data'

const defaultHero = {
  name: 'Your Name',
  title: 'Creative Developer & Designer',
  quote: 'The best way to predict the future is to create it.',
  bio: 'Passionate about crafting elegant digital experiences that blend form and function.',
  avatar: '',
}

const defaultSocial = {
  facebook: '',
  instagram: '',
  linkedin: '',
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export const usePortfolioStore = defineStore('portfolio', () => {
  const saved = load()

  const hero = ref(saved?.hero ?? { ...defaultHero })
  const achievements = ref(saved?.achievements ?? [])
  const projects = ref(saved?.projects ?? [])
  const social = ref(saved?.social ?? { ...defaultSocial })
  const inquiries = ref(saved?.inquiries ?? [])

  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hero: hero.value,
        achievements: achievements.value,
        projects: projects.value,
        social: social.value,
        inquiries: inquiries.value,
      })
    )
  }

  // ── Hero ──────────────────────────────────────────────
  function updateHero(data) {
    hero.value = { ...data }
    persist()
  }

  // ── Achievements ─────────────────────────────────────
  function addAchievement(item) {
    achievements.value.push({ ...item, id: Date.now() })
    persist()
  }
  function updateAchievement(id, data) {
    const idx = achievements.value.findIndex((a) => a.id === id)
    if (idx !== -1) achievements.value[idx] = { ...data, id }
    persist()
  }
  function deleteAchievement(id) {
    achievements.value = achievements.value.filter((a) => a.id !== id)
    persist()
  }

  // ── Projects ──────────────────────────────────────────
  function addProject(item) {
    projects.value.push({ ...item, id: Date.now() })
    persist()
  }
  function updateProject(id, data) {
    const idx = projects.value.findIndex((p) => p.id === id)
    if (idx !== -1) projects.value[idx] = { ...data, id }
    persist()
  }
  function deleteProject(id) {
    projects.value = projects.value.filter((p) => p.id !== id)
    persist()
  }

  // ── Social ────────────────────────────────────────────
  function updateSocial(data) {
    social.value = { ...data }
    persist()
  }

  // ── Inquiries ─────────────────────────────────────────
  function addInquiry(item) {
    inquiries.value.unshift({
      ...item,
      id: Date.now(),
      date: new Date().toISOString(),
      read: false,
    })
    persist()
  }
  function markInquiryRead(id) {
    const inquiry = inquiries.value.find((i) => i.id === id)
    if (inquiry) {
      inquiry.read = true
      persist()
    }
  }
  function deleteInquiry(id) {
    inquiries.value = inquiries.value.filter((i) => i.id !== id)
    persist()
  }

  return {
    hero,
    achievements,
    projects,
    social,
    inquiries,
    updateHero,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addProject,
    updateProject,
    deleteProject,
    updateSocial,
    addInquiry,
    markInquiryRead,
    deleteInquiry,
  }
})
