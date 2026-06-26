export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'
export const SESSION_KEY = 'yuju-session'

export const today = new Date().toISOString().slice(0, 10)
export const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const initialPlanner = {
  weeklyGoal: 'Preparar mis cursos prioritarios de la semana',
  targetHours: 10,
  startDate: today,
  endDate: nextWeek,
  priority: 'HIGH' as const,
  planStatus: 'ACTIVE' as const,
}

export const initialProgress = {
  studyHours: 0,
  completedGoals: 0,
  currentStreak: 0,
  motivationLevel: 7,
}

export const initialMaterial = {
  title: '',
  description: '',
  materialType: 'PDF' as const,
  category: '',
  price: 0,
  fileUrl: 'https://example.com/material.pdf',
}

export const initialListing = { materialId: '', transactionType: 'SALE' as const, stock: 1 }
