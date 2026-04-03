import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

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

// Rejects after `ms` milliseconds so saves never hang forever.
function withTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Check your connection.')), ms)
    ),
  ])
}

// Select-then-insert-or-update avoids the upsert RLS deadlock on Supabase free tier.
async function savePortfolioData(userId, hero, social) {
  const { data: existing } = await withTimeout(
    supabase.from('portfolio_data').select('id').eq('user_id', userId).maybeSingle()
  )
  if (existing) {
    const { error } = await withTimeout(
      supabase.from('portfolio_data').update({ hero, social }).eq('user_id', userId)
    )
    if (error) throw new Error(error.message)
  } else {
    const { error } = await withTimeout(
      supabase.from('portfolio_data').insert({ user_id: userId, hero, social })
    )
    if (error) throw new Error(error.message)
  }
}

export const usePortfolioStore = defineStore('portfolio', () => {
  const hero = ref({ ...defaultHero })
  const achievements = ref([])
  const projects = ref([])
  const social = ref({ ...defaultSocial })
  const inquiries = ref([])
  const loading = ref(false)
  const notFound = ref(false)
  const ownerId = ref(null)

  // ── Fetch helpers ─────────────────────────────────────

  async function fetchForOwner(userId) {
    if (!userId) return
    loading.value = true
    notFound.value = false
    ownerId.value = userId

    const [pdRes, achRes, projRes, inqRes] = await Promise.all([
      supabase.from('portfolio_data').select('hero, social').eq('user_id', userId).maybeSingle(),
      supabase.from('achievements').select('*').eq('user_id', userId).order('sort_order'),
      supabase.from('projects').select('*').eq('user_id', userId).order('sort_order'),
      supabase
        .from('inquiries')
        .select('*')
        .eq('portfolio_user_id', userId)
        .order('created_at', { ascending: false }),
    ])

    hero.value = pdRes.data?.hero ?? { ...defaultHero }
    social.value = pdRes.data?.social ?? { ...defaultSocial }
    achievements.value = (achRes.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.image,
      date: r.date,
      sort_order: r.sort_order,
    }))
    projects.value = (projRes.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.image,
      live_url: r.live_url,
      github_url: r.github_url,
      tech: r.tech ?? [],
      sort_order: r.sort_order,
    }))
    inquiries.value = (inqRes.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      subject: r.subject,
      message: r.message,
      read: r.read,
      date: r.created_at,
    }))

    loading.value = false
  }

  async function fetchByUsername(username) {
    if (!username) return
    loading.value = true
    notFound.value = false

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (!profile) {
      notFound.value = true
      loading.value = false
      return
    }

    ownerId.value = profile.id

    const [pdRes, achRes, projRes] = await Promise.all([
      supabase.from('portfolio_data').select('hero, social').eq('user_id', profile.id).maybeSingle(),
      supabase.from('achievements').select('*').eq('user_id', profile.id).order('sort_order'),
      supabase.from('projects').select('*').eq('user_id', profile.id).order('sort_order'),
    ])

    hero.value = pdRes.data?.hero ?? { ...defaultHero }
    social.value = pdRes.data?.social ?? { ...defaultSocial }
    achievements.value = (achRes.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.image,
      date: r.date,
      sort_order: r.sort_order,
    }))
    projects.value = (projRes.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.image,
      live_url: r.live_url,
      github_url: r.github_url,
      tech: r.tech ?? [],
      sort_order: r.sort_order,
    }))
    inquiries.value = []

    loading.value = false
  }

  // ── Hero ──────────────────────────────────────────────
  async function updateHero(data) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    hero.value = { ...data }
    await savePortfolioData(ownerId.value, data, social.value)
  }

  // ── Achievements ─────────────────────────────────────
  async function addAchievement(item) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    const { data, error } = await withTimeout(
      supabase
        .from('achievements')
        .insert({ ...item, user_id: ownerId.value, sort_order: achievements.value.length })
        .select()
        .single()
    )
    if (error) throw new Error(error.message)
    achievements.value.push({
      id: data.id, title: data.title, description: data.description,
      image: data.image, date: data.date, sort_order: data.sort_order,
    })
  }

  async function updateAchievement(id, data) {
    const { error } = await withTimeout(
      supabase.from('achievements').update(data).eq('id', id)
    )
    if (error) throw new Error(error.message)
    const idx = achievements.value.findIndex((a) => a.id === id)
    if (idx !== -1) achievements.value[idx] = { ...achievements.value[idx], ...data, id }
  }

  async function deleteAchievement(id) {
    const { error } = await withTimeout(
      supabase.from('achievements').delete().eq('id', id)
    )
    if (error) throw new Error(error.message)
    achievements.value = achievements.value.filter((a) => a.id !== id)
  }

  // ── Projects ──────────────────────────────────────────
  async function addProject(item) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    const { data, error } = await withTimeout(
      supabase
        .from('projects')
        .insert({
          title: item.title, description: item.description, image: item.image,
          live_url: item.live_url ?? '', github_url: item.github_url ?? '',
          tech: item.tech ?? [], user_id: ownerId.value,
          sort_order: projects.value.length,
        })
        .select()
        .single()
    )
    if (error) throw new Error(error.message)
    projects.value.push({
      id: data.id, title: data.title, description: data.description, image: data.image,
      live_url: data.live_url, github_url: data.github_url,
      tech: data.tech ?? [], sort_order: data.sort_order,
    })
  }

  async function updateProject(id, data) {
    const payload = {
      title: data.title, description: data.description, image: data.image,
      live_url: data.live_url ?? '', github_url: data.github_url ?? '', tech: data.tech ?? [],
    }
    const { error } = await withTimeout(
      supabase.from('projects').update(payload).eq('id', id)
    )
    if (error) throw new Error(error.message)
    const idx = projects.value.findIndex((p) => p.id === id)
    if (idx !== -1) projects.value[idx] = { ...projects.value[idx], ...payload, id }
  }

  async function deleteProject(id) {
    const { error } = await withTimeout(
      supabase.from('projects').delete().eq('id', id)
    )
    if (error) throw new Error(error.message)
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  // ── Social ────────────────────────────────────────────
  async function updateSocial(data) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    social.value = { ...data }
    await savePortfolioData(ownerId.value, hero.value, data)
  }

  // ── Inquiries ─────────────────────────────────────────
  async function addInquiry(item) {
    const { data, error } = await withTimeout(
      supabase
        .from('inquiries')
        .insert({ ...item, portfolio_user_id: ownerId.value })
        .select()
        .single()
    )
    if (error) throw new Error(error.message)
    inquiries.value.unshift({
      id: data.id, name: data.name, email: data.email,
      subject: data.subject, message: data.message, read: data.read, date: data.created_at,
    })
  }

  async function markInquiryRead(id) {
    const { error } = await withTimeout(
      supabase.from('inquiries').update({ read: true }).eq('id', id)
    )
    if (error) throw new Error(error.message)
    const inquiry = inquiries.value.find((i) => i.id === id)
    if (inquiry) inquiry.read = true
  }

  async function deleteInquiry(id) {
    const { error } = await withTimeout(
      supabase.from('inquiries').delete().eq('id', id)
    )
    if (error) throw new Error(error.message)
    inquiries.value = inquiries.value.filter((i) => i.id !== id)
  }

  return {
    hero,
    achievements,
    projects,
    social,
    inquiries,
    loading,
    notFound,
    ownerId,
    fetchForOwner,
    fetchByUsername,
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
