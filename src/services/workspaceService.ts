import { API_URL } from '../config'
import type { Listing, ListingForm, Material, MaterialForm, PaymentMethod, Planner, PlannerForm, Progress, ProgressForm, Recommendation, Transaction } from '../types'
import { apiRequest } from './api'

export type UploadResult = { secureUrl: string; publicId: string }

export async function uploadMaterialFile(token: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    let message = `Error ${response.status}`
    try {
      const data = await response.json()
      message = data.message || data.error || message
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return response.json() as Promise<UploadResult>
}

export function getMaterials(token: string) {
  return apiRequest<Material[]>('/materials', { token })
}

export function createMaterial(token: string, payload: MaterialForm) {
  return apiRequest<Material>('/materials', { method: 'POST', token, body: JSON.stringify(payload) })
}

export function getListings(token: string) {
  return apiRequest<Listing[]>('/marketplace', { token })
}

export function createListing(token: string, payload: ListingForm) {
  return apiRequest<Listing>('/marketplace/listings', {
    method: 'POST',
    token,
    body: JSON.stringify({ ...payload, materialId: Number(payload.materialId) }),
  })
}

export function purchaseListing(token: string, listingId: number, paymentMethod: PaymentMethod) {
  return apiRequest(`/marketplace/listings/${listingId}/purchase`, {
    method: 'POST',
    token,
    body: JSON.stringify({ paymentMethod }),
  })
}

export function getTransactions(token: string) {
  return apiRequest<Transaction[]>('/marketplace/transactions/me', { token })
}

export function getPlanner(token: string) {
  return apiRequest<Planner>('/planners/me', { token })
}

export function getPlanners(token: string) {
  return apiRequest<Planner[]>('/planners/me/all', { token })
}

export function savePlanner(token: string, payload: PlannerForm) {
  return apiRequest<Planner>('/planners/me', { method: 'PUT', token, body: JSON.stringify(payload) })
}

export function getProgress(token: string) {
  return apiRequest<Progress>('/progress/me', { token })
}

export function saveProgress(token: string, payload: ProgressForm) {
  return apiRequest<Progress>('/progress/me', { method: 'PUT', token, body: JSON.stringify(payload) })
}

export function getRecommendations(token: string) {
  return apiRequest<Recommendation[]>('/recommendations/me', { token })
}

export function generateRecommendation(token: string) {
  return apiRequest<Recommendation>('/recommendations/me/generate', { method: 'POST', token })
}

export function askMentor(token: string, prompt: string) {
  return apiRequest<{ answer: string; generatedAt: string }>('/recommendations/me/ask', {
    method: 'POST',
    token,
    body: JSON.stringify({ prompt }),
  })
}
