const DEFAULT_PRODUCTS_API_URL = 'http://localhost:3002'
const configuredProductsApiUrl = import.meta.env.VITE_PRODUCTS_API_URL?.trim()
const productsApiUrl = (configuredProductsApiUrl || DEFAULT_PRODUCTS_API_URL).replace(
  /\/+$/,
  '',
)
const productsEndpoint = `${productsApiUrl}/api/productos`

const errorMessagesByStatus = {
  400: 'Los datos enviados no son válidos.',
  404: 'No se encontró el producto solicitado.',
  500: 'El servicio de productos no pudo completar la operación.',
}

class ProductServiceError extends Error {
  constructor(message, { code = 'PRODUCT_SERVICE_ERROR', status = null } = {}) {
    super(message)
    this.name = 'ProductServiceError'
    this.code = code
    this.status = status
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function invalidResponseError() {
  return new ProductServiceError(
    'El servicio de productos devolvió una respuesta inesperada.',
    { code: 'INVALID_RESPONSE' },
  )
}

function normalizeProduct(value) {
  if (!isRecord(value)) throw invalidResponseError()

  const id = Number(value.id)
  const price = Number(value.precio)
  const stock = Number(value.stock)
  const descriptionIsValid =
    value.descripcion === null || typeof value.descripcion === 'string'
  const creationDateIsValid =
    value.fecha_creacion === null || typeof value.fecha_creacion === 'string'
  const updateDateIsValid =
    value.fecha_actualizacion === null || typeof value.fecha_actualizacion === 'string'

  if (
    !Number.isInteger(id) ||
    id < 1 ||
    typeof value.nombre !== 'string' ||
    !value.nombre.trim() ||
    !descriptionIsValid ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    typeof value.categoria !== 'string' ||
    !value.categoria.trim() ||
    typeof value.activo !== 'boolean' ||
    !creationDateIsValid ||
    !updateDateIsValid
  ) {
    throw invalidResponseError()
  }

  return {
    id,
    nombre: value.nombre,
    descripcion: value.descripcion ?? '',
    precio: price,
    stock,
    categoria: value.categoria,
    activo: value.activo,
    fecha_creacion: value.fecha_creacion,
    fecha_actualizacion: value.fecha_actualizacion,
  }
}

function getResponseErrorMessage(status, payload) {
  if (isRecord(payload) && typeof payload.mensaje === 'string' && payload.mensaje.trim()) {
    return payload.mensaje
  }

  if (status >= 500) return errorMessagesByStatus[500]

  return errorMessagesByStatus[status] || 'No fue posible completar la operación.'
}

async function requestProducts(path = '', options = {}) {
  let response

  try {
    response = await fetch(`${productsEndpoint}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new ProductServiceError(
      'No fue posible conectar con el servicio de productos. Verifica que esté disponible.',
      { code: 'NETWORK_ERROR' },
    )
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    throw new ProductServiceError(
      'El servicio de productos devolvió una respuesta que no es JSON válido.',
      { code: 'INVALID_JSON', status: response.status },
    )
  }

  if (!response.ok) {
    throw new ProductServiceError(getResponseErrorMessage(response.status, payload), {
      code: `HTTP_${response.status}`,
      status: response.status,
    })
  }

  return payload
}

function getProductIdPath(productId) {
  const normalizedId = Number(productId)

  if (!Number.isInteger(normalizedId) || normalizedId < 1) {
    throw new ProductServiceError('El identificador del producto no es válido.', {
      code: 'INVALID_PRODUCT_ID',
    })
  }

  return `/${encodeURIComponent(normalizedId)}`
}

function toProductPayload(product) {
  return {
    nombre: product.nombre,
    descripcion: product.descripcion ?? '',
    precio: Number(product.precio),
    stock: Number(product.stock),
    categoria: product.categoria,
    activo: product.activo ?? true,
  }
}

function getWrappedProduct(payload) {
  if (!isRecord(payload) || !Object.hasOwn(payload, 'producto')) {
    throw invalidResponseError()
  }

  return normalizeProduct(payload.producto)
}

async function getProducts() {
  const payload = await requestProducts()

  if (!Array.isArray(payload)) throw invalidResponseError()
  return payload.map(normalizeProduct)
}

async function getAvailableProducts() {
  const products = await getProducts()
  return products.filter(({ activo, stock }) => activo && stock > 0)
}

async function getProductById(productId) {
  const payload = await requestProducts(getProductIdPath(productId))
  return normalizeProduct(payload)
}

async function createProduct(product) {
  const payload = await requestProducts('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toProductPayload(product)),
  })

  return getWrappedProduct(payload)
}

async function updateProduct(productId, product) {
  const payload = await requestProducts(getProductIdPath(productId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toProductPayload(product)),
  })

  return getWrappedProduct(payload)
}

async function deactivateProduct(productId) {
  const productPath = getProductIdPath(productId)
  const payload = await requestProducts(productPath, { method: 'DELETE' })

  if (
    !isRecord(payload) ||
    !isRecord(payload.producto) ||
    Number(payload.producto.id) !== Number(productId) ||
    payload.producto.activo !== false
  ) {
    throw invalidResponseError()
  }

  return getProductById(productId)
}

export {
  ProductServiceError,
  createProduct,
  deactivateProduct,
  getAvailableProducts,
  getProductById,
  getProducts,
  updateProduct,
}
