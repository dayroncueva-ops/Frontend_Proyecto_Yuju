import { API_URL } from '../config'

type RequestOptions = RequestInit & { token?: string | null }

const errorTranslations: Array<[RegExp, string]> = [
  [/Authentication is required/i, 'Debes iniciar sesion para realizar esta accion.'],
  [/Access denied/i, 'No tienes permisos para realizar esta accion.'],
  [/Bad credentials/i, 'Correo o contrasena incorrectos.'],
  [/User not found/i, 'Usuario no encontrado.'],
  [/Planner not found/i, 'No hay un plan registrado.'],
  [/End date must be after start date/i, 'La fecha de fin debe ser posterior a la fecha de inicio.'],
  [/Material file URL is required/i, 'Primero selecciona y sube un archivo.'],
  [/Material file must be uploaded through Cloudinary/i, 'El archivo debe subirse desde el selector de archivo.'],
  [/A file is required/i, 'Selecciona un archivo para continuar.'],
  [/File size must not exceed 20 MB/i, 'El archivo no debe superar los 20 MB.'],
  [/Only PDF, image and video files are allowed/i, 'Solo se permiten archivos PDF, imagenes o videos.'],
  [/Cloudinary upload failed/i, 'No se pudo subir el archivo a Cloudinary.'],
  [/Unexpected server error/i, 'Ocurrio un error inesperado en el servidor.'],
]

export function translateApiError(message: string) {
  for (const [pattern, translation] of errorTranslations) {
    if (pattern.test(message)) return translation
  }
  if (/Network request failed|Failed to fetch/i.test(message)) {
    return 'No se pudo conectar con el backend. Revisa la URL de la API y que el servidor este levantado.'
  }
  if (/Error 4\d\d/.test(message)) return 'No se pudo completar la solicitud. Revisa los datos ingresados.'
  if (/Error 5\d\d/.test(message)) return 'El servidor tuvo un problema. Intenta nuevamente.'
  return message
}

export async function readErrorMessage(response: Response) {
  let message = `Error ${response.status}`
  try {
    const data = await response.json()
    message = data.message || data.error || message
  } catch {
    message = response.statusText || message
  }
  return translateApiError(message)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })

    if (!response.ok) throw new Error(await readErrorMessage(response))
    if (response.status === 204) return undefined as T
    return response.json()
  } catch (error) {
    throw new Error(translateApiError(error instanceof Error ? error.message : 'No se pudo completar la accion.'))
  }
}
