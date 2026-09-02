import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import SaleDetail from '../components/sales/SaleDetail.jsx'
import useAuth from '../context/useAuth.js'
import { getAvailableProducts } from '../services/productService.js'
import { registerSale } from '../services/salesService.js'
import formatCurrency from '../utils/formatCurrency.js'

function SalesPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [items, setItems] = useState([])
  const [selectionError, setSelectionError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registeredSale, setRegisteredSale] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const availableProducts = await getAvailableProducts()
      setProducts(availableProducts)
    } catch {
      setLoadError('No fue posible cargar los productos disponibles de demostración.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getAvailableProducts()
      .then((availableProducts) => {
        if (isCurrent) setProducts(availableProducts)
      })
      .catch(() => {
        if (isCurrent) {
          setLoadError('No fue posible cargar los productos disponibles de demostración.')
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const reservedStock = useMemo(
    () => new Map(items.map((item) => [String(item.producto.id), item.cantidad])),
    [items],
  )

  const selectedProduct = useMemo(
    () => products.find(({ id }) => String(id) === selectedProductId) ?? null,
    [products, selectedProductId],
  )

  const selectedRemainingStock = selectedProduct
    ? selectedProduct.stock - (reservedStock.get(String(selectedProduct.id)) ?? 0)
    : 0

  const total = useMemo(
    () => items.reduce((accumulator, item) => accumulator + item.subtotal, 0),
    [items],
  )

  const sellerName = user?.name || user?.email || ''

  const handleProductChange = (event) => {
    setSelectedProductId(event.target.value)
    setQuantity('1')
    setSelectionError('')
  }

  const handleAddProduct = (event) => {
    event.preventDefault()
    setSelectionError('')
    setRegisterError('')
    setRegisteredSale(null)

    if (!selectedProduct) {
      setSelectionError('Selecciona un producto disponible.')
      return
    }

    const requestedQuantity = Number(quantity)

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      setSelectionError('La cantidad debe ser un número entero mayor que cero.')
      return
    }

    if (requestedQuantity > selectedRemainingStock) {
      setSelectionError(
        `Solo hay ${selectedRemainingStock} ${selectedRemainingStock === 1 ? 'unidad disponible' : 'unidades disponibles'} para agregar.`,
      )
      return
    }

    setItems((currentItems) => {
      const currentItem = currentItems.find(
        (item) => item.producto.id === selectedProduct.id,
      )

      if (currentItem) {
        const nextQuantity = currentItem.cantidad + requestedQuantity
        return currentItems.map((item) =>
          item.producto.id === selectedProduct.id
            ? {
                ...item,
                cantidad: nextQuantity,
                subtotal: nextQuantity * item.precioUnitario,
              }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          producto: {
            id: selectedProduct.id,
            nombre: selectedProduct.nombre,
            stock: selectedProduct.stock,
          },
          cantidad: requestedQuantity,
          precioUnitario: selectedProduct.precio,
          subtotal: requestedQuantity * selectedProduct.precio,
        },
      ]
    })

    setSelectedProductId('')
    setQuantity('1')
  }

  const handleChangeQuantity = (productId, nextQuantity) => {
    const product = products.find(({ id }) => id === productId)

    if (!product || !Number.isInteger(nextQuantity) || nextQuantity < 1) return

    if (nextQuantity > product.stock) {
      setRegisterError(`La cantidad de ${product.nombre} supera el stock disponible.`)
      return
    }

    setRegisterError('')
    setRegisteredSale(null)
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.producto.id === productId
          ? {
              ...item,
              cantidad: nextQuantity,
              subtotal: nextQuantity * item.precioUnitario,
            }
          : item,
      ),
    )
  }

  const handleRemoveProduct = (productId) => {
    setRegisterError('')
    setRegisteredSale(null)
    setItems((currentItems) =>
      currentItems.filter((item) => item.producto.id !== productId),
    )
  }

  const handleRegisterSale = async () => {
    if (items.length === 0 || isRegistering) return

    setIsRegistering(true)
    setRegisterError('')
    setRegisteredSale(null)

    try {
      const sale = await registerSale({
        usuario: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null,
        items,
      })

      setRegisteredSale(sale)
      setItems([])
      setSelectedProductId('')
      setQuantity('1')
    } catch (error) {
      setRegisterError(
        error instanceof Error
          ? error.message
          : 'No fue posible registrar la venta de demostración.',
      )
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="page sales-page">
      <PageHeader
        eyebrow="Punto de venta"
        title="Nueva venta"
        description="Selecciona productos disponibles y prepara una venta provisional en quetzales."
      />

      <aside className="mock-notice" aria-label="Información sobre el registro">
        <span aria-hidden="true">M</span>
        <p>
          <strong>Registro de demostración.</strong> Las ventas se conservan solo durante
          esta ejecución y no se envían a ningún backend.
        </p>
      </aside>

      <div className="sale-status-region" aria-live="polite">
        {registeredSale && (
          <div className="sale-feedback sale-feedback--success" role="status">
            <div>
              <strong>Venta registrada correctamente</strong>
              <p>
                Identificador local: <span>{registeredSale.id}</span>
              </p>
            </div>
            <span>{formatCurrency(registeredSale.total)}</span>
          </div>
        )}
      </div>

      <div className="sales-workspace">
        <section className="sales-card sale-selection" aria-labelledby="sale-selection-title">
          <header className="sales-card__header">
            <div>
              <p>Catálogo</p>
              <h2 id="sale-selection-title">Agregar producto</h2>
            </div>
            {!isLoading && !loadError && (
              <span className="sales-card__badge">{products.length} disponibles</span>
            )}
          </header>

          {sellerName && (
            <p className="sale-seller">
              Venta atendida por <strong>{sellerName}</strong>
            </p>
          )}

          {isLoading && (
            <div className="sale-load-state" aria-live="polite" aria-busy="true">
              <span className="sale-load-state__spinner" aria-hidden="true" />
              <strong>Cargando productos</strong>
              <p>Consultando el catálogo provisional…</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="sale-load-state sale-load-state--error" role="alert">
              <strong>No se pudo cargar el catálogo</strong>
              <p>{loadError}</p>
              <button className="secondary-button" type="button" onClick={loadProducts}>
                Intentar nuevamente
              </button>
            </div>
          )}

          {!isLoading && !loadError && products.length === 0 && (
            <div className="sale-load-state">
              <strong>No hay productos disponibles</strong>
              <p>El catálogo no contiene productos activos con existencias.</p>
            </div>
          )}

          {!isLoading && !loadError && products.length > 0 && (
            <form className="sale-selection-form" onSubmit={handleAddProduct} noValidate>
              <div className="sale-field">
                <label htmlFor="sale-product">Producto</label>
                <select
                  id="sale-product"
                  value={selectedProductId}
                  aria-invalid={Boolean(selectionError && !selectedProduct)}
                  disabled={isRegistering}
                  onChange={handleProductChange}
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => {
                    const remainingStock =
                      product.stock - (reservedStock.get(String(product.id)) ?? 0)

                    return (
                      <option
                        key={product.id}
                        value={String(product.id)}
                        disabled={remainingStock < 1}
                      >
                        {product.nombre} · {formatCurrency(product.precio)} ·{' '}
                        {remainingStock} disponibles
                      </option>
                    )
                  })}
                </select>
              </div>

              {selectedProduct && (
                <div className="selected-product-summary" aria-live="polite">
                  <span>{selectedProduct.categoria}</span>
                  <strong>{selectedProduct.nombre}</strong>
                  <p>
                    {formatCurrency(selectedProduct.precio)} por unidad ·{' '}
                    {selectedRemainingStock} disponibles para agregar
                  </p>
                </div>
              )}

              <div className="sale-field">
                <label htmlFor="sale-quantity">Cantidad</label>
                <input
                  id="sale-quantity"
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedRemainingStock : undefined}
                  step="1"
                  inputMode="numeric"
                  value={quantity}
                  aria-describedby={
                    selectionError ? 'sale-selection-error' : 'sale-quantity-help'
                  }
                  aria-invalid={Boolean(selectionError)}
                  disabled={!selectedProduct || isRegistering}
                  onChange={(event) => {
                    setQuantity(event.target.value)
                    setSelectionError('')
                  }}
                />
                <small id="sale-quantity-help">
                  Utiliza cantidades enteras sin superar las existencias.
                </small>
              </div>

              {selectionError && (
                <p className="sale-form-error" id="sale-selection-error" role="alert">
                  {selectionError}
                </p>
              )}

              <button
                className="primary-button sale-add-button"
                type="submit"
                disabled={!selectedProduct || isRegistering || selectedRemainingStock < 1}
              >
                Agregar al detalle
              </button>
            </form>
          )}
        </section>

        <SaleDetail
          items={items}
          total={total}
          isRegistering={isRegistering}
          registerError={registerError}
          onChangeQuantity={handleChangeQuantity}
          onRemove={handleRemoveProduct}
          onRegister={handleRegisterSale}
        />
      </div>
    </div>
  )
}

export default SalesPage
