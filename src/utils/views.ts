import type { View } from '../types'

const labels: Record<View, string> = {
  dashboard: 'Dashboard',
  planner: 'Planificador',
  materials: 'Materiales',
  marketplace: 'Marketplace',
  mentor: 'Mentor IA',
}

export function viewLabel(view: View) {
  return labels[view]
}

export function allViews() {
  return Object.keys(labels) as View[]
}
