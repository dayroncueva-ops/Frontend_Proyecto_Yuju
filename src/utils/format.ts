export function formatDate(value?: string) {
  if (!value) return 'Sin registro'
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value))
}

export function money(value: number) {
  return `S/ ${Number(value).toFixed(2)}`
}
