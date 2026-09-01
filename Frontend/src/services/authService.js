const DEFAULT_API_URL = '/usuarios-api'
const configuredApiUrl =
  import.meta.env.VITE_AUTH_API_PROXY_PATH?.trim() ||
  import.meta.env.VITE_AUTH_API_URL?.trim()
const API_URL = (configuredApiUrl || DEFAULT_API_URL).replace(/\/+$/, '')

class AuthServiceError extends Error {
  constructor(message, { status = 0, code = 'AUTH_REQUEST_FAILED', cause } = {}) {
    super(message, { cause })
    this.name = 'AuthServiceError'
    this.status = status
    this.code = code
  }
}

function getErrorMessage(status, code) {
  if (status === 401 && code === 'INVALID_CREDENTIALS') {
    return 'El correo o la contraseña son incorrectos.'
  }

  if (status === 401) {
    return 'La sesión no es válida o ha expirado.'
  }

  if (status === 403) {
    return 'No tienes permisos para realizar esta acción.'
  }

  if (status === 400) {
    return 'Revisa los datos ingresados e intenta nuevamente.'
  }

  if (status >= 500) {
    return 'El servicio de usuarios no está disponible en este momento.'
  }

  return 'No fue posible completar la solicitud de autenticación.'
}

async function parseJsonResponse(response) {
  try {
    return await response.json()
  } catch {
    throw new AuthServiceError('El servicio devolvió una respuesta no válida.', {
      status: response.status,
      code: 'INVALID_RESPONSE',
    })
  }
}

async function request(path, { token, ...options } = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (cause) {
    throw new AuthServiceError(
      'No fue posible conectar con el servicio de usuarios. Verifica que esté disponible.',
      { code: 'NETWORK_ERROR', cause },
    )
  }

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    const code = typeof data?.code === 'string' ? data.code : 'AUTH_REQUEST_FAILED'
    throw new AuthServiceError(getErrorMessage(response.status, code), {
      status: response.status,
      code,
    })
  }

  return data
}

function isUser(user) {
  return (
    user &&
    (typeof user.id === 'number' || typeof user.id === 'string') &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    Array.isArray(user.roles)
  )
}

async function login({ email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!data || typeof data.token !== 'string' || !isUser(data.user)) {
    throw new AuthServiceError('El servicio devolvió una respuesta de autenticación no válida.', {
      code: 'INVALID_AUTH_RESPONSE',
    })
  }

  return data
}

async function getUserById(userId, token) {
  const user = await request(`/api/users/${encodeURIComponent(userId)}`, { token })

  if (!isUser(user)) {
    throw new AuthServiceError('El servicio devolvió información de usuario no válida.', {
      code: 'INVALID_USER_RESPONSE',
    })
  }

  return user
}

export { AuthServiceError, getUserById, login }
