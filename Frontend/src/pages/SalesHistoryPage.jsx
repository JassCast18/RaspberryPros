import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import SaleHistoryDetail from '../components/sales/SaleHistoryDetail.jsx'
import SaleHistoryList from '../components/sales/SaleHistoryList.jsx'
import { cancelSale, getSaleById, getSales } from '../services/salesService.js'

function SalesHistoryPage() {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState(null)
  const [loadingSaleId, setLoadingSaleId] = useState('')
  const [detailError, setDetailError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelMessage, setCancelMessage] = useState('')

  const loadSales = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const saleList = await getSales()
      setSales(saleList)
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'No fue posible consultar el historial.',
      )
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
      .catch((error) => {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'No fue posible consultar el historial.',
          )
        }
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
      const saleId = String(sale.id).toLocaleLowerCase('es')
      const userId = String(sale.usuario?.id ?? sale.idUsuario ?? '').toLocaleLowerCase(
        'es',
      )
      return saleId.includes(normalizedSearch) || userId.includes(normalizedSearch)
    })
  }, [sales, searchTerm])

  const handleOpenDetail = async (saleId) => {
    setLoadingSaleId(String(saleId))
    setDetailError('')
    setCancelError('')
    setCancelMessage('')

    try {
      const sale = await getSaleById(saleId)
      setSelectedSale(sale)
    } catch (error) {
      setDetailError(
        error instanceof Error
          ? error.message
          : 'No fue posible consultar el detalle de la venta.',
      )
    } finally {
      setLoadingSaleId('')
    }
  }

  const handleCancelSale = async (sale) => {
    if (sale.estado === 'anulada' || isCancelling) return

    const confirmed = window.confirm(
      `¿Deseas anular la venta ${sale.id}? El registro permanecerá en el historial.`,
    )
    if (!confirmed) return

    setIsCancelling(true)
    setCancelError('')
    setCancelMessage('')

    try {
      const updatedSale = await cancelSale(sale.id)
      setSelectedSale(updatedSale)
      setSales((currentSales) =>
        currentSales.map((currentSale) =>
          String(currentSale.id) === String(updatedSale.id) ? updatedSale : currentSale,
        ),
      )
      setCancelMessage(`La venta ${updatedSale.id} fue anulada correctamente.`)
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : 'No fue posible anular la venta.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCloseDetail = () => {
    setSelectedSale(null)
    setCancelError('')
    setCancelMessage('')
  }

  const clearSearch = () => setSearchTerm('')

  return (
    <div className="page sales-history-page">
      <PageHeader
        eyebrow="Consultas"
        title="Historial de ventas"
        description="Consulta las ventas persistidas y revisa el detalle de cada operación."
      />

      <section className="history-panel" aria-labelledby="sales-history-list-title">
        <header className="history-panel__header">
          <div>
            <p>Operaciones</p>
            <h2 id="sales-history-list-title">Ventas registradas</h2>
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
            <p>Consultando las ventas registradas…</p>
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
            <h3>No hay ventas registradas.</h3>
            <p>Registra una venta para que aparezca en el historial.</p>
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
                  placeholder="ID de venta o usuario"
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
                <p>No hay ventas que coincidan con el ID de venta o usuario ingresado.</p>
                <button className="secondary-button" type="button" onClick={clearSearch}>
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedSale && (
        <SaleHistoryDetail
          sale={selectedSale}
          isCancelling={isCancelling}
          cancelError={cancelError}
          cancelMessage={cancelMessage}
          onCancel={handleCancelSale}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

export default SalesHistoryPage
