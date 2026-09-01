// Registro provisional exclusivo de FRONT-05A. No representa el contrato del backend futuro.
let mockSalesStore = []
let mockSaleSequence = 0

function waitForMockOperation() {
  return new Promise((resolve) => setTimeout(resolve, 250))
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function cloneSale(sale) {
  return {
    ...sale,
    usuario: sale.usuario ? { ...sale.usuario } : null,
    items: sale.items.map((item) => ({
      ...item,
      producto: { ...item.producto },
    })),
  }
}

function normalizeItem(item) {
  const quantity = Number(item?.cantidad)
  const unitPrice = Number(item?.precioUnitario)
  const stock = Number(item?.producto?.stock)

  if (!item?.producto || item.producto.id === undefined || !item.producto.nombre) {
    throw new Error('Uno de los productos de la venta no es válido.')
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Todas las cantidades deben ser números enteros mayores que cero.')
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error('Uno de los precios de la venta no es válido.')
  }

  if (Number.isFinite(stock) && quantity > stock) {
    throw new Error(`La cantidad de ${item.producto.nombre} supera el stock disponible.`)
  }

  return {
    producto: {
      id: item.producto.id,
      nombre: item.producto.nombre,
    },
    cantidad: quantity,
    precioUnitario: roundCurrency(unitPrice),
    subtotal: roundCurrency(unitPrice * quantity),
  }
}

async function registerSale({ usuario = null, items }) {
  await waitForMockOperation()

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Agrega al menos un producto antes de registrar la venta.')
  }

  const normalizedItems = items.map(normalizeItem)
  const now = new Date()
  mockSaleSequence += 1

  const sale = {
    id: `VENTA-${now.getTime()}-${String(mockSaleSequence).padStart(3, '0')}`,
    fecha: now.toISOString(),
    usuario: usuario ? { ...usuario } : null,
    items: normalizedItems,
    total: roundCurrency(
      normalizedItems.reduce((accumulator, item) => accumulator + item.subtotal, 0),
    ),
  }

  mockSalesStore = [sale, ...mockSalesStore]
  return cloneSale(sale)
}

export { registerSale }
