import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import SaleHistoryDetail from '../components/sales/SaleHistoryDetail.jsx'
import SaleHistoryList from '../components/sales/SaleHistoryList.jsx'
import { getSaleById, getSales } from '../services/salesService.js'

function SalesHistoryPage() {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState(null)
  const [loadingSaleId, setLoadingSaleId] = useState('')
  const [detailError, setDetailError] = useState('')

  const loadSales = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const saleList = await getSales()
      setSales(saleList)
    } catch {
      setLoadError('No fue posible consultar el historial provisional.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getSales()
      .then((saleList) => {
        if (isCurrent) setSales(saleList)
      })
      .catch(() => {
        if (isCurrent) setLoadError('No fue posible consultar el historial provisional.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredSales = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es')
    if (!normalizedSearch) return sales

    return sales.filter((sale) => {
      const userName = sale.usuario?.name || sale.usuario?.email || ''
      return (
        sale.id.toLocaleLowerCase('es').includes(normalizedSearch) ||
        userName.toLocaleLowerCase('es').includes(normalizedSearch)
      )
    })
  }, [sales, searchTerm])

  const handleOpenDetail = async (saleId) => {
    setLoadingSaleId(saleId)
    setDetailError('')

    try {
      const sale = await getSaleById(saleId)

      if (!sale) {
        setDetailError('La venta seleccionada ya no está disponible en esta sesión.')
        return
      }

      setSelectedSale(sale)
    } catch {
      setDetailError('No fue posible consultar el detalle de la venta.')
    } finally {
      setLoadingSaleId('')
    }
  }

  const clearSearch = () => setSearchTerm('')

  return (
    <div className="page sales-history-page">
      <PageHeader
        eyebrow="Consultas"
        title="Historial de ventas"
        description="Revisa las ventas registradas durante la ejecución actual de la aplicación."
      />

      <aside className="sales-mock-notice" aria-label="Información sobre el historial">
        <span aria-hidden="true">M</span>
        <p>
          <strong>Historial de demostración.</strong> Utiliza el mismo almacenamiento en
          memoria del registro de ventas y se limpia al recargar.
        </p>
      </aside>

      <section className="history-panel" aria-labelledby="sales-history-list-title">
        <header className="history-panel__header">
          <div>
            <p>Operaciones locales</p>
            <h2 id="sales-history-list-title">Ventas de esta sesión</h2>
          </div>
          {!isLoading && !loadError && (
            <span className="sales-card__badge">
              {sales.length} {sales.length === 1 ? 'venta' : 'ventas'}
            </span>
          )}
        </header>

        {isLoading && (
          <div className="history-state" aria-live="polite" aria-busy="true">
            <span className="sale-load-state__spinner" aria-hidden="true" />
            <h3>Cargando historial</h3>
            <p>Consultando las ventas registradas en memoria…</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="history-state history-state--error" role="alert">
            <h3>No se pudo cargar el historial</h3>
            <p>{loadError}</p>
            <button className="secondary-button" type="button" onClick={loadSales}>
              Intentar nuevamente
            </button>
          </div>
        )}

        {!isLoading && !loadError && sales.length === 0 && (
          <div className="history-state history-state--empty">
            <span className="history-state__icon" aria-hidden="true">
              0
            </span>
            <h3>No hay ventas registradas en esta sesión.</h3>
            <p>Registra una venta para que aparezca en este historial provisional.</p>
            <Link className="primary-button history-empty-action" to="/ventas">
              Registrar una venta
            </Link>
          </div>
        )}

        {!isLoading && !loadError && sales.length > 0 && (
          <>
            <div className="history-toolbar">
              <div className="history-search-field">
                <label htmlFor="sale-history-search">Buscar venta</label>
                <input
                  id="sale-history-search"
                  type="search"
                  value={searchTerm}
                  placeholder="Identificador o usuario"
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <p aria-live="polite">
                <strong>{filteredSales.length}</strong>{' '}
                {filteredSales.length === 1 ? 'resultado' : 'resultados'}
              </p>
            </div>

            {detailError && (
              <p className="history-detail-error" role="alert">
                {detailError}
              </p>
            )}

            {filteredSales.length > 0 ? (
              <SaleHistoryList
                sales={filteredSales}
                loadingSaleId={loadingSaleId}
                onSelect={handleOpenDetail}
              />
            ) : (
              <div className="history-state history-state--filtered">
                <h3>Sin resultados</h3>
                <p>No hay ventas que coincidan con el identificador o usuario ingresado.</p>
                <button className="secondary-button" type="button" onClick={clearSearch}>
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedSale && (
        <SaleHistoryDetail sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  )
}

export default SalesHistoryPage
