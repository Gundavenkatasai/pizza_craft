import type { User } from '../types'
import { authAPI } from './api'

export const authService = {
  async signUp(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
  }) {
    try {
      const { data } = await authAPI.register(userData)
      return data
    } catch (err: any) {
      if (err?.response) {
        const msg = err.response.data?.error || err.response.data?.message || `Registration failed (status ${err.response.status})`
        throw new Error(msg)
      }
      if (err?.message && err.message.includes('Network')) {
        throw new Error('Cannot reach server. Is the backend running on port 3001?')
      }
      throw new Error('Registration failed. Please retry.')
    }
  },

  async login(email: string, password: string) {
    try {
      const { data } = await authAPI.login({ email, password })
      const { token, user } = data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      return { user, token }
    } catch (err: any) {
      if (err?.response) {
        const msg = err.response.data?.error || err.response.data?.message || 'Login failed'
        throw new Error(msg)
      }
      throw new Error('Login failed. Please retry.')
    }
  },

  async signOut() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return true
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Prefer cached user for speed
      const cached = localStorage.getItem('user')
      if (cached) {
        return JSON.parse(cached)
      }
      // Skip network call if no token stored
      const token = localStorage.getItem('token')
      if (!token) {
        return null
      }
      const { data } = await authAPI.getCurrentUser()
      const u = data?.user
      if (u) {
        localStorage.setItem('user', JSON.stringify(u))
      }
      return u || null
    } catch (e) {
      return null
    }
  },

  async resetPassword(email: string) {
    const { data } = await authAPI.forgotPassword(email)
    return data
  }
}