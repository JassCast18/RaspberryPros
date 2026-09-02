import formatCurrency from '../../utils/formatCurrency.js'
import formatDateTime from '../../utils/formatDateTime.js'

function getUserLabel(user) {
  return user?.name || user?.email || 'No disponible'
}

function getUnitCount(items) {
  return items.reduce((total, item) => total + item.cantidad, 0)
}

function SaleHistoryList({ sales, loadingSaleId, onSelect }) {
  return (
    <div className="history-table-wrap">
      <table className="history-table">
        <caption className="visually-hidden">Ventas registradas durante esta sesión</caption>
        <thead>
          <tr>
            <th scope="col">Identificador</th>
            <th scope="col">Fecha y hora</th>
            <th scope="col">Usuario</th>
            <th scope="col">Unidades</th>
            <th scope="col">Total</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const unitCount = getUnitCount(sale.items)
            const isLoading = loadingSaleId === sale.id

            return (
              <tr key={sale.id}>
                <td data-label="Identificador">
                  <strong className="history-sale-id">{sale.id}</strong>
                </td>
                <td data-label="Fecha y hora">{formatDateTime(sale.fecha)}</td>
                <td data-label="Usuario">{getUserLabel(sale.usuario)}</td>
                <td data-label="Unidades">
                  {unitCount} {unitCount === 1 ? 'unidad' : 'unidades'}
                </td>
                <td data-label="Total" className="history-total-cell">
                  {formatCurrency(sale.total)}
                </td>
                <td data-label="Acción">
                  <button
                    className="history-detail-button"
                    type="button"
                    disabled={Boolean(loadingSaleId)}
                    onClick={() => onSelect(sale.id)}
                  >
                    {isLoading ? 'Consultando…' : 'Ver detalle'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default SaleHistoryList
