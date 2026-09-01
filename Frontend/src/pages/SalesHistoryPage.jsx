import PageHeader from '../components/common/PageHeader.jsx'

function SalesHistoryPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Consultas"
        title="Historial de ventas"
        description="Revisa las operaciones registradas en el sistema."
      />

      <section className="module-placeholder" aria-labelledby="history-module-title">
        <span className="module-placeholder__tag">Módulo preparado</span>
        <h2 id="history-module-title">Consulta de operaciones</h2>
        <p>El listado y los filtros de ventas se incorporarán en un próximo sprint.</p>
      </section>
    </div>
  )
}

export default SalesHistoryPage
