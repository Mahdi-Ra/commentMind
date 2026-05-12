import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cm_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, full_name?: string) =>
    api.post('/auth/register', { email, password, full_name }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  me: () => api.get('/auth/me'),
}

// ─── Sites ───────────────────────────────────────────────────────────────────
export const sitesApi = {
  list: () => api.get('/sites'),

  create: (data: {
    name: string
    domain: string
    tone?: string
    language?: string
    custom_instructions?: string
    auto_reply?: boolean
    auto_approve?: boolean
    auto_spam?: boolean
  }) => api.post('/sites', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/sites/${id}`, data),

  regenerateKey: (id: string) =>
    api.post(`/sites/${id}/regenerate-key`),
}

// ─── Comments ────────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (siteId: string, params?: { status?: string; page?: number; limit?: number }) =>
    api.get(`/sites/${siteId}/comments`, { params }),

  stats: (siteId: string) =>
    api.get(`/sites/${siteId}/stats`),
}

// ─── Knowledge Base ──────────────────────────────────────────────────────────
export const knowledgeApi = {
  list: (siteId: string) =>
    api.get(`/sites/${siteId}/knowledge`),

  add: (siteId: string, content: string, source_name?: string) =>
    api.post(`/sites/${siteId}/knowledge`, { content, source_name }),

  upload: (siteId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/sites/${siteId}/knowledge/upload`, form)
  },

  delete: (siteId: string, chunkId: string) =>
    api.delete(`/sites/${siteId}/knowledge/${chunkId}`),

  clear: (siteId: string) =>
    api.delete(`/sites/${siteId}/knowledge`),
}
