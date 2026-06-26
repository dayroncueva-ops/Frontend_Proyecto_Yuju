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
  [/Material file must be uploaded through Cloudinary/i, 'El archivo debe subirse desde el boton de archivo.'],
  [/Material file URL must be a valid HTTP URL/i, 'La URL del archivo debe ser valida.'],
  [/A file is required/i, 'Selecciona un archivo para continuar.'],
  [/File size must not exceed 20 MB/i, 'El archivo no debe superar los 20 MB.'],
  [/Only PDF, image and video files are allowed/i, 'Solo se permiten archivos PDF, imagenes o videos.'],
  [/Cloudinary is not configured/i, 'Cloudinary no esta configurado correctamente.'],
  [/Cloudinary returned an invalid upload response/i, 'Cloudinary devolvio una respuesta invalida.'],
  [/Cloudinary upload was interrupted/i, 'La subida del archivo fue interrumpida.'],
  [/Cloudinary upload failed: Invalid Signature/i, 'Cloudinary rechazo la firma. Revisa que el cloud name, API key y API secret correspondan a la misma cuenta.'],
  [/Cloudinary upload failed/i, 'No se pudo subir el archivo a Cloudinary.'],
  [/Stock unavailable/i, 'No hay stock disponible.'],
  [/Validation failed/i, 'Revisa los campos del formulario.'],
  [/Unexpected server error/i, 'Ocurrio un error inesperado en el servidor.'],
]

export function translateApiError(message: string) {
  for (const [pattern, translation] of errorTranslations) {
    if (pattern.test(message)) return translation
  }
  if (/Error 4\d\d/.test(message)) return 'No se pudo completar la solicitud. Revisa los datos ingresados.'
  if (/Error 5\d\d/.test(message)) return 'El servidor tuvo un problema. Intenta nuevamente.'
  return message
}

async function readErrorMessage(response: Response) {
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
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export async function apiErrorMessage(response: Response) {
  return readErrorMessage(response)
}
