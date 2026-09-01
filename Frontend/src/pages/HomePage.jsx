import PageHeader from '../components/common/PageHeader.jsx'
import StatCard from '../components/common/StatCard.jsx'

const dashboardStats = [
  {
    label: 'Productos',
    value: '128',
    detail: 'productos registrados',
    symbol: 'PR',
  },
  {
    label: 'Ventas',
    value: '24',
    detail: 'ventas realizadas hoy',
    symbol: 'VT',
  },
  {
    label: 'Total vendido',
    value: 'Q18,450.00',
    detail: 'acumulado del día',
    symbol: 'GTQ',
  },
]

function HomePage() {
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
        <div className="welcome-panel__mark" aria-hidden="true">
          RP
        </div>
      </section>

      <section aria-labelledby="summary-title">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Actividad</p>
            <h2 id="summary-title">Resumen del día</h2>
          </div>
          <span className="demo-label">Datos de demostración</span>
        </div>

        <div className="stats-grid">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
