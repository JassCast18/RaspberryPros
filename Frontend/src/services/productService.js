import initialMockProducts from '../mocks/products.js'

// Almacén temporal en memoria. Se restablece al recargar la aplicación.
let mockProductStore = initialMockProducts.map((product) => ({ ...product }))

function cloneProduct(product) {
  return { ...product }
}

function waitForMockOperation() {
  return new Promise((resolve) => setTimeout(resolve, 200))
}

async function getProducts() {
  await waitForMockOperation()
  return mockProductStore.map(cloneProduct)
}

async function createProduct(product) {
  await waitForMockOperation()

  const nextId = Math.max(0, ...mockProductStore.map(({ id }) => Number(id))) + 1
  const createdProduct = { ...product, id: nextId }
  mockProductStore = [createdProduct, ...mockProductStore]
  return cloneProduct(createdProduct)
}

async function updateProduct(productId, changes) {
  await waitForMockOperation()

  const productIndex = mockProductStore.findIndex(({ id }) => id === productId)
  if (productIndex === -1) {
    throw new Error('No se encontró el producto que intentas editar.')
  }

  const updatedProduct = { ...mockProductStore[productIndex], ...changes, id: productId }
  mockProductStore = mockProductStore.map((product, index) =>
    index === productIndex ? updatedProduct : product,
  )
  return cloneProduct(updatedProduct)
}

export { createProduct, getProducts, updateProduct }
