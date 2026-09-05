import { create } from 'zustand'
import { authApi } from '@/lib/api'

interface User {
  id: string
  email: string
  full_name?: string
  plan: string
  is_verified: boolean
  is_admin?: boolean
  plan_display_name?: string
  plan_max_sites?: number
  plan_max_comments_month?: number
  trial_plan?: string
  trial_ends_at?: string
  trial_days_left?: number
  plan_ends_at?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('cm_token') : null,
  isLoading: false,

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    const token = res.data.access_token
    localStorage.setItem('cm_token', token)
    set({ token })
    const me = await authApi.me()
    set({ user: me.data })
  },

  register: async (email, password, name) => {
    const res = await authApi.register(email, password, name)
    const token = res.data.access_token
    localStorage.setItem('cm_token', token)
    set({ token })
    const me = await authApi.me()
    set({ user: me.data })
  },

  logout: () => {
    localStorage.removeItem('cm_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    try {
      const me = await authApi.me()
      set({ user: me.data })
    } catch {
      localStorage.removeItem('cm_token')
      set({ user: null, token: null })
    }
  },

  setUser: (user) => set({ user }),
}))
