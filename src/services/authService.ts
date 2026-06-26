import { SESSION_KEY } from '../config'
import type { AuthResponse, LoginForm, RegisterForm, Session } from '../types'
import { apiRequest } from './api'

export function getStoredSession(): Session | null {
  const saved = localStorage.getItem(SESSION_KEY)
  return saved ? JSON.parse(saved) : null
}

export function storeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function login(payload: LoginForm) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function register(payload: RegisterForm) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}
