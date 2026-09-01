import PageHeader from '../components/common/PageHeader.jsx'

function SalesPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Punto de venta"
        title="Nueva venta"
        description="Registra una nueva operación de venta desde este módulo."
      />

      <section className="module-placeholder" aria-labelledby="sales-module-title">
        <span className="module-placeholder__tag">Módulo preparado</span>
        <h2 id="sales-module-title">Registro de ventas</h2>
        <p>El flujo de captura de ventas se incorporará en un próximo sprint.</p>
      </section>
    </div>
  )
}

export default SalesPage
