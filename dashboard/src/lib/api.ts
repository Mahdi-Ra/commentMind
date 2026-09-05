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

  updateProfile: (data: { full_name?: string }) => api.patch('/auth/me', data),

  changePassword: (current_password: string, new_password: string) =>
    api.post('/auth/change-password', { current_password, new_password }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),

  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),

  resendVerification: () => api.post('/auth/resend-verification'),

  onboarding: () => api.get('/auth/onboarding'),
}

// ─── Sites ───────────────────────────────────────────────────────────────────
export const sitesApi = {
  list: () => api.get('/sites'),

  get: (id: string) => api.get(`/sites/${id}`),

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

  getEmbed: (id: string) => api.get(`/sites/${id}/embed`),

  testConnection: (id: string, api_key: string) =>
    api.post(`/sites/${id}/test-connection`, { api_key }),
}

// ─── Comments ────────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (siteId: string, params?: { status?: string; page?: number; limit?: number }) =>
    api.get(`/sites/${siteId}/comments`, { params }),

  stats: (siteId: string) =>
    api.get(`/sites/${siteId}/stats`),

  moderate: (siteId: string, commentId: string, data: { action: string; ai_reply?: string }) =>
    api.patch(`/sites/${siteId}/comments/${commentId}`, data),

  usage: () =>
    api.get('/usage'),

  insights: () =>
    api.get('/insights'),

  siteInsights: (siteId: string) =>
    api.get(`/sites/${siteId}/insights`),
}

// ─── Billing / Crypto Checkout ─────────────────────────────────────────────
export const billingApi = {
  checkout: (data: {
    plan: string
    billing_cycle: 'monthly' | 'annual'
    currency: 'USDT' | 'TRX'
    network: 'TRC20'
  }) => api.post('/billing/checkout', data),

  payments: () => api.get('/billing/payments'),

  submitTx: (paymentId: string, data: { tx_hash: string; note?: string }) =>
    api.post(`/billing/payments/${paymentId}/submit`, data),

  startTrial: (plan: string) =>
    api.post('/billing/trial', { plan }),
}

// ─── Customer feedback ──────────────────────────────────────────────────────
export const feedbackApi = {
  create: (data: { rating: number; message?: string }) => api.post('/feedback', data),
}

// ─── Platform admin ─────────────────────────────────────────────────────────
export const adminApi = {
  overview: () => api.get('/admin/overview'),
  users: (search?: string) => api.get('/admin/users', { params: { search } }),
  updateUser: (userId: string, data: { plan?: string; is_active?: boolean }) =>
    api.patch(`/admin/users/${userId}`, data),
  sites: () => api.get('/admin/sites'),
  payments: () => api.get('/admin/payments'),
  confirmPayment: (paymentId: string) => api.post(`/admin/payments/${paymentId}/confirm`),
  feedback: () => api.get('/admin/feedback'),
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

// ─── Google Search Console ──────────────────────────────────────────────────
export const searchConsoleApi = {
  status: (siteId: string) => api.get(`/sites/${siteId}/search-console`),
  authorize: (siteId: string) => api.get(`/sites/${siteId}/search-console/authorize`),
  selectProperty: (siteId: string, property_url: string) =>
    api.post(`/sites/${siteId}/search-console/property`, { property_url }),
  disconnect: (siteId: string) => api.delete(`/sites/${siteId}/search-console`),
}

// ─── Shopify ─────────────────────────────────────────────────────────────────
export const shopifyApi = {
  status: (siteId: string) => api.get(`/sites/${siteId}/shopify`),
  authorize: (siteId: string, shop: string) => api.post(`/sites/${siteId}/shopify/authorize`, { shop }),
  sync: (siteId: string) => api.post(`/sites/${siteId}/shopify/sync`),
  disconnect: (siteId: string) => api.delete(`/sites/${siteId}/shopify`),
}
