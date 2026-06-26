import AsyncStorage from '@react-native-async-storage/async-storage'
import { SESSION_KEY } from '../config'
import type { AuthResponse, LoginForm, RegisterForm, Session } from '../types'
import { apiRequest } from './api'

export async function getStoredSession(): Promise<Session | null> {
  const saved = await AsyncStorage.getItem(SESSION_KEY)
  return saved ? JSON.parse(saved) : null
}

export async function storeSession(session: Session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY)
}

export function login(payload: LoginForm) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function register(payload: RegisterForm) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}
