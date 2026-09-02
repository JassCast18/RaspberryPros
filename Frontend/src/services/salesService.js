const DEFAULT_SALES_API_URL = '/ventas-api'
const configuredSalesApiUrl =
  import.meta.env.VITE_SALES_API_PROXY_PATH?.trim() ||
  import.meta.env.VITE_SALES_API_URL?.trim()
const salesApiUrl = (configuredSalesApiUrl || DEFAULT_SALES_API_URL).replace(/\/+$/, '')
const salesEndpoint = `${salesApiUrl}/api/ventas`

const errorMessagesByCode = {
  VALIDATION_ERROR: 'Revisa los datos de la venta e intenta nuevamente.',
  PRODUCT_NOT_AVAILABLE: 'Uno de los productos seleccionados ya no está disponible.',
  INSUFFICIENT_STOCK: 'No hay existencias suficientes para completar la venta.',
  SALE_NOT_FOUND: 'La venta solicitada no existe.',
}

class SalesServiceError extends Error {
  constructor(message, { code = 'SALES_SERVICE_ERROR', status = null, cause } = {}) {
    super(message, { cause })
    this.name = 'SalesServiceError'
    this.code = code
    this.status = status
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function invalidResponseError() {
  return new SalesServiceError(
    'El servicio de ventas devolvió una respuesta inesperada.',
    { code: 'INVALID_RESPONSE' },
  )
}

function getErrorMessage(status, code) {
  if (errorMessagesByCode[code]) return errorMessagesByCode[code]

  if (status === 400) return errorMessagesByCode.VALIDATION_ERROR
  if (status === 401) return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.'
  if (status === 403) return 'No tienes permisos para realizar esta acción.'
  if (status === 404) return 'No se encontró el recurso solicitado.'
  if (status === 409) return 'La venta no pudo completarse por el estado actual del producto.'
  if (status === 502) {
    return 'No fue posible validar la información con Usuarios o Productos.'
  }
  if (status === 503) return 'El servicio de ventas no está disponible en este momento.'
  if (status === 504) return 'La validación de la venta tardó demasiado. Intenta nuevamente.'
  if (status >= 500) return 'El servicio de ventas no pudo completar la operación.'

  return 'No fue posible completar la solicitud de ventas.'
}

async function requestSales(path = '', { token, ...options } = {}) {
  let response

  try {
    response = await fetch(`${salesEndpoint}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (cause) {
    throw new SalesServiceError(
      'No fue posible conectar con el servicio de ventas. Verifica que esté disponible.',
      { code: 'NETWORK_ERROR', cause },
    )
  }

  let payload

  try {
    const responseText = await response.text()
    payload = responseText ? JSON.parse(responseText) : null
  } catch (cause) {
    throw new SalesServiceError(
      'El servicio de ventas devolvió una respuesta que no es JSON válido.',
      { code: 'INVALID_JSON', status: response.status, cause },
    )
  }

  if (!response.ok) {
    const code = typeof payload?.code === 'string' ? payload.code : `HTTP_${response.status}`
    throw new SalesServiceError(getErrorMessage(response.status, code), {
      code,
      status: response.status,
    })
  }

  return payload
}

function normalizeIdentifier(value) {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 1) throw invalidResponseError()
    return value
  }

  const text = typeof value === 'string' ? value.trim() : ''
  if (!/^[1-9]\d*$/.test(text)) throw invalidResponseError()
  return text
}

function normalizeMoney(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) throw invalidResponseError()
  return amount
}

function normalizeDetail(value) {
  if (!isRecord(value) || typeof value.nombreProducto !== 'string') {
    throw invalidResponseError()
  }

  const quantity = Number(value.cantidad)
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw invalidResponseError()

  return {
    id: normalizeIdentifier(value.id),
    producto: {
      id: normalizeIdentifier(value.idProducto),
      nombre: value.nombreProducto,
    },
    cantidad: quantity,
    precioUnitario: normalizeMoney(value.precioUnitario),
    subtotal: normalizeMoney(value.subtotal),
  }
}

function normalizeSale(value, knownUser = null) {
  if (
    !isRecord(value) ||
    typeof value.fecha !== 'string' ||
    typeof value.estado !== 'string' ||
    !Array.isArray(value.detalles)
  ) {
    throw invalidResponseError()
  }

  const idUsuario = normalizeIdentifier(value.idUsuario)
  const userMatchesSale = knownUser && String(knownUser.id) === String(idUsuario)

  return {
    id: normalizeIdentifier(value.id),
    idUsuario,
    usuario: userMatchesSale
      ? {
          id: idUsuario,
          ...(typeof knownUser.name === 'string' ? { name: knownUser.name } : {}),
          ...(typeof knownUser.email === 'string' ? { email: knownUser.email } : {}),
        }
      : { id: idUsuario },
    fecha: value.fecha,
    estado: value.estado.trim().toLocaleLowerCase('es'),
    total: normalizeMoney(value.total),
    items: value.detalles.map(normalizeDetail),
  }
}

function getPositiveInteger(value, message, code) {
  const normalizedValue = Number(value)

  if (!Number.isSafeInteger(normalizedValue) || normalizedValue < 1) {
    throw new SalesServiceError(message, { code })
  }

  return normalizedValue
}

function getSalePath(saleId) {
  const normalizedId = getPositiveInteger(
    saleId,
    'El identificador de la venta no es válido.',
    'INVALID_SALE_ID',
  )
  return `/${encodeURIComponent(normalizedId)}`
}

async function registerSale({ user, usuario, items, token } = {}) {
  const currentUser = user ?? usuario

  if (!currentUser) {
    throw new SalesServiceError('Se requiere un usuario autenticado para registrar la venta.', {
      code: 'USER_REQUIRED',
    })
  }

  const idUsuario = getPositiveInteger(
    currentUser.id,
    'El usuario autenticado no tiene un identificador válido.',
    'INVALID_USER_ID',
  )

  if (typeof token !== 'string' || !token.trim()) {
    throw new SalesServiceError('Se requiere una sesión válida para registrar la venta.', {
      code: 'TOKEN_REQUIRED',
    })
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new SalesServiceError('Agrega al menos un producto antes de registrar la venta.', {
      code: 'ITEMS_REQUIRED',
    })
  }

  const productos = items.map((item) => ({
    idProducto: getPositiveInteger(
      item?.producto?.id,
      'Uno de los productos seleccionados no tiene un identificador válido.',
      'INVALID_PRODUCT_ID',
    ),
    cantidad: getPositiveInteger(
      item?.cantidad,
      'Todas las cantidades deben ser números enteros mayores que cero.',
      'INVALID_QUANTITY',
    ),
  }))

  const payload = await requestSales('', {
    method: 'POST',
    token: token.trim(),
    body: JSON.stringify({ idUsuario, productos }),
  })

  return normalizeSale(payload, currentUser)
}

async function getSales() {
  const payload = await requestSales()

  if (!isRecord(payload) || !Array.isArray(payload.ventas)) {
    throw invalidResponseError()
  }

  return payload.ventas.map((sale) => normalizeSale(sale))
}

async function getSaleById(saleId) {
  const payload = await requestSales(getSalePath(saleId))
  return normalizeSale(payload)
}

async function cancelSale(saleId) {
  const payload = await requestSales(`${getSalePath(saleId)}/anular`, {
    method: 'PATCH',
  })
  return normalizeSale(payload)
}

export { SalesServiceError, cancelSale, getSaleById, getSales, registerSale }
