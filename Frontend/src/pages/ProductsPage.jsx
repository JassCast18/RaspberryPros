import PageHeader from '../components/common/PageHeader.jsx'

function ProductsPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Inventario"
        title="Productos"
        description="Consulta y administra el catálogo de productos del sistema."
      />

      <section className="module-placeholder" aria-labelledby="products-module-title">
        <span className="module-placeholder__tag">Módulo preparado</span>
        <h2 id="products-module-title">Gestión de productos</h2>
        <p>Las herramientas de inventario se incorporarán en un próximo sprint.</p>
      </section>
    </div>
  )
}

export default ProductsPage
