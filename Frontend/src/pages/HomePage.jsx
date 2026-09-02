import { useEffect, useState } from 'react'
import BrandLogo from '../components/common/BrandLogo.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import StatCard from '../components/common/StatCard.jsx'
import { getProducts } from '../services/productService.js'
import { getSales } from '../services/salesService.js'
import formatCurrency from '../utils/formatCurrency.js'

const initialMetric = {
  status: 'loading',
  value: 0,
}

function HomePage() {
  const [productMetric, setProductMetric] = useState(initialMetric)
  const [salesMetric, setSalesMetric] = useState({
    ...initialMetric,
    total: 0,
  })

  useEffect(() => {
    let isCurrent = true

    getProducts()
      .then((products) => {
        if (isCurrent) {
          setProductMetric({ status: 'success', value: products.length })
        }
      })
      .catch(() => {
        if (isCurrent) setProductMetric({ status: 'error', value: 0 })
      })

    getSales()
      .then((sales) => {
        if (!isCurrent) return

        const total = sales.reduce((accumulator, sale) => {
          const saleTotal = Number(sale.total)
          return Number.isFinite(saleTotal) ? accumulator + saleTotal : accumulator
        }, 0)

        setSalesMetric({ status: 'success', value: sales.length, total })
      })
      .catch(() => {
        if (isCurrent) setSalesMetric({ status: 'error', value: 0, total: 0 })
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const productValue =
    productMetric.status === 'loading'
      ? '…'
      : productMetric.status === 'error'
        ? '—'
        : String(productMetric.value)

  const salesValue =
    salesMetric.status === 'loading'
      ? '…'
      : salesMetric.status === 'error'
        ? '—'
        : String(salesMetric.value)

  const totalValue =
    salesMetric.status === 'loading'
      ? '…'
      : salesMetric.status === 'error'
        ? '—'
        : formatCurrency(salesMetric.total)

  const dashboardStats = [
    {
      label: 'Productos',
      value: productValue,
      detail:
        productMetric.status === 'loading'
          ? 'Consultando catálogo de productos…'
          : productMetric.status === 'error'
            ? 'No fue posible consultar los productos'
            : `${productMetric.value} ${productMetric.value === 1 ? 'producto registrado' : 'productos registrados'} en el catálogo`,
      symbol: 'PR',
    },
    {
      label: 'Ventas',
      value: salesValue,
      detail:
        salesMetric.status === 'loading'
          ? 'Consultando ventas de la sesión…'
          : salesMetric.status === 'error'
            ? 'No fue posible consultar las ventas'
            : `${salesMetric.value} ${salesMetric.value === 1 ? 'venta registrada' : 'ventas registradas'} en esta sesión`,
      symbol: 'VT',
    },
    {
      label: 'Total vendido',
      value: totalValue,
      detail:
        salesMetric.status === 'loading'
          ? 'Calculando total de la sesión…'
          : salesMetric.status === 'error'
            ? 'No fue posible calcular el total vendido'
            : 'Total acumulado durante esta sesión',
      symbol: 'GTQ',
    },
  ]

  return (
    <div className="page dashboard-page">
      <PageHeader
        eyebrow="Resumen general"
        title="Panel principal"
        description="Consulta rápidamente el estado general del sistema de ventas."
      />

      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div>
          <span className="welcome-panel__badge">Entorno demostrativo</span>
          <h2 id="welcome-title">Bienvenido a RaspberryPros</h2>
          <p>
            Desde este panel podrás acceder al catálogo de productos, registrar
            ventas y consultar el historial de operaciones.
          </p>
        </div>
        <BrandLogo className="welcome-panel__mark" />
      </section>

      <section aria-labelledby="summary-title">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Actividad</p>
            <h2 id="summary-title">Resumen de la sesión</h2>
          </div>
          <span className="demo-label">Datos de demostración</span>
        </div>

        <div className="stats-grid" aria-live="polite">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
