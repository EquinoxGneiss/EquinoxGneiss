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

// Calls `fn()` and rejects after `ms` ms. Factory-based so retries create fresh requests.
function withTimeout(fn, ms = 25000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    Promise.resolve(fn())
      .then(v => { clearTimeout(timer); resolve(v) })
      .catch(e => { clearTimeout(timer); reject(e) })
  })
}

// Select-then-insert-or-update avoids the upsert RLS deadlock on Supabase free tier.
async function savePortfolioData(userId, hero, social, theme) {
  const { data: existing } = await withTimeout(() =>
    supabase.from('portfolio_data').select('id').eq('user_id', userId).maybeSingle()
  )
  if (existing) {
    const { error } = await withTimeout(() =>
      supabase.from('portfolio_data').update({ hero, social, theme }).eq('user_id', userId)
    )
    if (error) throw new Error(error.message)
  } else {
    const { error } = await withTimeout(() =>
      supabase.from('portfolio_data').insert({ user_id: userId, hero, social, theme })
    )
    if (error) throw new Error(error.message)
  }
}

export const usePortfolioStore = defineStore('portfolio', () => {
  const hero = ref({ ...defaultHero })
  const achievements = ref([])
  const projects = ref([])
  const social = ref({ ...defaultSocial })
  const theme = ref('dark')
  const inquiries = ref([])
  const loading = ref(false)
  const notFound = ref(false)
  const ownerId = ref(null)
  const retrying = ref(false)

  // On timeout, waits 3 s then retries once; sets retrying so UI can show a banner.
  async function withRetry(fn) {
    try {
      return await fn()
    } catch (e) {
      if (e.message !== 'timeout') throw e
      retrying.value = true
      await new Promise(r => setTimeout(r, 3000))
      try {
        return await fn()
      } finally {
        retrying.value = false
      }
    }
  }

  // ── Fetch helpers ─────────────────────────────────────

  async function fetchForOwner(userId) {
    if (!userId) return
    loading.value = true
    notFound.value = false
    ownerId.value = userId

    const [pdRes, achRes, projRes, inqRes] = await Promise.all([
      supabase.from('portfolio_data').select('hero, social, theme').eq('user_id', userId).maybeSingle(),
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
    theme.value = pdRes.data?.theme ?? 'dark'
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
      supabase.from('portfolio_data').select('hero, social, theme').eq('user_id', profile.id).maybeSingle(),
      supabase.from('achievements').select('*').eq('user_id', profile.id).order('sort_order'),
      supabase.from('projects').select('*').eq('user_id', profile.id).order('sort_order'),
    ])

    hero.value = pdRes.data?.hero ?? { ...defaultHero }
    social.value = pdRes.data?.social ?? { ...defaultSocial }
    theme.value = pdRes.data?.theme ?? 'dark'
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
    await withRetry(() => savePortfolioData(ownerId.value, data, social.value, theme.value))
  }

  // Upload avatar file to Supabase Storage, return the public URL.
  // Replaces any previous avatar for this user (same path = auto-overwrite).
  async function uploadAvatar(file) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${ownerId.value}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  // ── Theme ─────────────────────────────────────────────
  async function updateTheme(name) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    theme.value = name
    await withRetry(async () => {
      const { data: existing } = await withTimeout(() =>
        supabase.from('portfolio_data').select('id').eq('user_id', ownerId.value).maybeSingle()
      )
      if (existing) {
        const { error } = await withTimeout(() =>
          supabase.from('portfolio_data').update({ theme: name }).eq('user_id', ownerId.value)
        )
        if (error) throw new Error(error.message)
      } else {
        const { error } = await withTimeout(() =>
          supabase.from('portfolio_data').insert({ user_id: ownerId.value, hero: hero.value, social: social.value, theme: name })
        )
        if (error) throw new Error(error.message)
      }
    })
  }

  // ── Achievements ─────────────────────────────────────
  async function addAchievement(item) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    const result = await withRetry(async () => {
      const { data, error } = await withTimeout(() =>
        supabase
          .from('achievements')
          .insert({ ...item, user_id: ownerId.value, sort_order: achievements.value.length })
          .select()
          .single()
      )
      if (error) throw new Error(error.message)
      return data
    })
    achievements.value.push({
      id: result.id, title: result.title, description: result.description,
      image: result.image, date: result.date, sort_order: result.sort_order,
    })
  }

  async function updateAchievement(id, data) {
    await withRetry(async () => {
      const { error } = await withTimeout(() =>
        supabase.from('achievements').update(data).eq('id', id)
      )
      if (error) throw new Error(error.message)
    })
    const idx = achievements.value.findIndex((a) => a.id === id)
    if (idx !== -1) achievements.value[idx] = { ...achievements.value[idx], ...data, id }
  }

  async function deleteAchievement(id) {
    await withRetry(async () => {
      const { error } = await withTimeout(() =>
        supabase.from('achievements').delete().eq('id', id)
      )
      if (error) throw new Error(error.message)
    })
    achievements.value = achievements.value.filter((a) => a.id !== id)
  }

  // ── Projects ──────────────────────────────────────────
  async function addProject(item) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    const result = await withRetry(async () => {
      const { data, error } = await withTimeout(() =>
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
      return data
    })
    projects.value.push({
      id: result.id, title: result.title, description: result.description, image: result.image,
      live_url: result.live_url, github_url: result.github_url,
      tech: result.tech ?? [], sort_order: result.sort_order,
    })
  }

  async function updateProject(id, data) {
    const payload = {
      title: data.title, description: data.description, image: data.image,
      live_url: data.live_url ?? '', github_url: data.github_url ?? '', tech: data.tech ?? [],
    }
    await withRetry(async () => {
      const { error } = await withTimeout(() =>
        supabase.from('projects').update(payload).eq('id', id)
      )
      if (error) throw new Error(error.message)
    })
    const idx = projects.value.findIndex((p) => p.id === id)
    if (idx !== -1) projects.value[idx] = { ...projects.value[idx], ...payload, id }
  }

  async function deleteProject(id) {
    await withRetry(async () => {
      const { error } = await withTimeout(() =>
        supabase.from('projects').delete().eq('id', id)
      )
      if (error) throw new Error(error.message)
    })
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  // ── Social ────────────────────────────────────────────
  async function updateSocial(data) {
    if (!ownerId.value) throw new Error('Not ready yet — please wait a moment and try again.')
    social.value = { ...data }
    await withRetry(() => savePortfolioData(ownerId.value, hero.value, data, theme.value))
  }

  // ── Inquiries ─────────────────────────────────────────
  async function addInquiry(item) {
    await withRetry(async () => {
      const { error } = await withTimeout(() =>
        supabase
          .from('inquiries')
          .insert({ ...item, portfolio_user_id: ownerId.value })
      )
      if (error) throw new Error(error.message)
    })
  }

  async function markInquiryRead(id) {
    await withRetry(async () => {
      const { error } = await withTimeout(() =>
        supabase.from('inquiries').update({ read: true }).eq('id', id)
      )
      if (error) throw new Error(error.message)
    })
    const inquiry = inquiries.value.find((i) => i.id === id)
    if (inquiry) inquiry.read = true
  }

  async function deleteInquiry(id) {
    await withRetry(async () => {
      const { error } = await withTimeout(() =>
        supabase.from('inquiries').delete().eq('id', id)
      )
      if (error) throw new Error(error.message)
    })
    inquiries.value = inquiries.value.filter((i) => i.id !== id)
  }

  return {
    hero,
    achievements,
    projects,
    social,
    theme,
    inquiries,
    loading,
    notFound,
    ownerId,
    retrying,
    fetchForOwner,
    fetchByUsername,
    updateHero,
    uploadAvatar,
    updateTheme,
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
