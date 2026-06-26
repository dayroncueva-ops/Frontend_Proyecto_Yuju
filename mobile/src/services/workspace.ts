import { API_URL } from '../config'
import type { Material, MaterialForm, Planner, PlannerForm, Progress, ProgressForm, Recommendation } from '../types'
import { apiRequest, readErrorMessage, translateApiError } from './api'

export type LocalUploadFile = {
  uri: string
  name: string
  mimeType?: string
}

export type UploadResult = { secureUrl: string; publicId: string }

export async function uploadMaterialFile(token: string, file: LocalUploadFile) {
  const formData = new FormData()
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob)

  try {
    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })

    if (!response.ok) throw new Error(await readErrorMessage(response))
    return response.json() as Promise<UploadResult>
  } catch (error) {
    throw new Error(translateApiError(error instanceof Error ? error.message : 'No se pudo subir el archivo.'))
  }
}

export function getMaterials(token: string) {
  return apiRequest<Material[]>('/materials', { token })
}

export function createMaterial(token: string, payload: MaterialForm) {
  return apiRequest<Material>('/materials', { method: 'POST', token, body: JSON.stringify(payload) })
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
