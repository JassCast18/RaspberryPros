import { useEffect, useRef } from 'react'
import formatCurrency from '../../utils/formatCurrency.js'
import formatDateTime from '../../utils/formatDateTime.js'

function getUserLabel(user) {
  return user?.name || user?.email || (user?.id ? `Usuario #${user.id}` : 'No disponible')
}

function getStatusLabel(status) {
  return status === 'anulada' ? 'Anulada' : 'Registrada'
}

function SaleHistoryDetail({
  sale,
  isCancelling,
  cancelError,
  cancelMessage,
  onCancel,
  onClose,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [sale.id])

  return (
    <section
      ref={panelRef}
      className="history-detail-panel"
      tabIndex="-1"
      aria-labelledby="sale-history-detail-title"
    >
      <header className="history-detail-header">
        <div>
          <p>Detalle de venta</p>
          <h2 id="sale-history-detail-title">Venta {sale.id}</h2>
        </div>
        <div className="history-detail-actions">
          {sale.estado !== 'anulada' && (
            <button
              className="history-cancel-button"
              type="button"
              disabled={isCancelling}
              onClick={() => onCancel(sale)}
            >
              {isCancelling ? 'Anulando…' : 'Anular venta'}
            </button>
          )}
          <button
            className="history-detail-close"
            type="button"
            disabled={isCancelling}
            onClick={onClose}
          >
            Cerrar detalle
          </button>
        </div>
      </header>

      <dl className="history-detail-metadata">
        <div>
          <dt>Identificador</dt>
          <dd>{sale.id}</dd>
        </div>
        <div>
          <dt>Fecha y hora</dt>
          <dd>{formatDateTime(sale.fecha)}</dd>
        </div>
        <div>
          <dt>Usuario</dt>
          <dd>{getUserLabel(sale.usuario)}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>
            <span
              className={`sale-status-badge sale-status-badge--${
                sale.estado === 'anulada' ? 'cancelled' : 'registered'
              }`}
            >
              {getStatusLabel(sale.estado)}
            </span>
          </dd>
        </div>
      </dl>

      <div className="history-detail-table-wrap">
        <table className="history-detail-table">
          <caption className="visually-hidden">Productos incluidos en la venta</caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Precio unitario</th>
              <th scope="col">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td data-label="Producto">{item.producto.nombre}</td>
                <td data-label="Cantidad">{item.cantidad}</td>
                <td data-label="Precio unitario">{formatCurrency(item.precioUnitario)}</td>
                <td data-label="Subtotal" className="history-total-cell">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cancelError && (
        <p className="history-detail-feedback history-detail-feedback--error" role="alert">
          {cancelError}
        </p>
      )}

      {cancelMessage && (
        <p className="history-detail-feedback history-detail-feedback--success" role="status">
          {cancelMessage}
        </p>
      )}

      <footer className="history-detail-total">
        <span>Total general</span>
        <strong>{formatCurrency(sale.total)}</strong>
        <small>Moneda: GTQ</small>
      </footer>
    </section>
  )
}

export default SaleHistoryDetail
