import formatCurrency from '../../utils/formatCurrency.js'

function SaleDetail({
  items,
  total,
  isRegistering,
  registerError,
  onChangeQuantity,
  onRemove,
  onRegister,
}) {
  return (
    <section className="sales-card sale-detail" aria-labelledby="sale-detail-title">
      <header className="sales-card__header">
        <div>
          <p>Resumen</p>
          <h2 id="sale-detail-title">Detalle de venta</h2>
        </div>
        <span className="sales-card__badge">
          {items.length} {items.length === 1 ? 'producto' : 'productos'}
        </span>
      </header>

      {items.length === 0 ? (
        <div className="sale-empty-state">
          <span aria-hidden="true">+</span>
          <h3>Aún no hay productos</h3>
          <p>Selecciona un producto y una cantidad para preparar la venta.</p>
        </div>
      ) : (
        <div className="sale-table-wrap">
          <table className="sale-table">
            <caption className="visually-hidden">Productos agregados a la venta</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Precio</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Subtotal</th>
                <th scope="col">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.producto.id}>
                  <td data-label="Producto">
                    <div className="sale-product-cell">
                      <strong>{item.producto.nombre}</strong>
                      <span>Stock disponible: {item.producto.stock}</span>
                    </div>
                  </td>
                  <td data-label="Precio" className="sale-money">
                    {formatCurrency(item.precioUnitario)}
                  </td>
                  <td data-label="Cantidad">
                    <div
                      className="quantity-stepper"
                      aria-label={`Cantidad de ${item.producto.nombre}`}
                    >
                      <button
                        type="button"
                        aria-label={`Reducir cantidad de ${item.producto.nombre}`}
                        disabled={isRegistering || item.cantidad <= 1}
                        onClick={() => onChangeQuantity(item.producto.id, item.cantidad - 1)}
                      >
                        −
                      </button>
                      <output aria-live="polite">{item.cantidad}</output>
                      <button
                        type="button"
                        aria-label={`Aumentar cantidad de ${item.producto.nombre}`}
                        disabled={isRegistering || item.cantidad >= item.producto.stock}
                        onClick={() => onChangeQuantity(item.producto.id, item.cantidad + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td data-label="Subtotal" className="sale-money sale-money--strong">
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td data-label="Acción">
                    <button
                      className="sale-remove-button"
                      type="button"
                      disabled={isRegistering}
                      onClick={() => onRemove(item.producto.id)}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="sale-summary">
        <div className="sale-total" aria-live="polite">
          <span>Total general</span>
          <strong>{formatCurrency(total)}</strong>
          <small>Moneda: GTQ</small>
        </div>

        {registerError && (
          <p className="sale-feedback sale-feedback--error" role="alert">
            {registerError}
          </p>
        )}

        <button
          className="primary-button sale-register-button"
          type="button"
          disabled={items.length === 0 || isRegistering}
          onClick={onRegister}
        >
          {isRegistering ? 'Registrando…' : 'Registrar venta'}
        </button>
      </footer>
    </section>
  )
}

export default SaleDetail
