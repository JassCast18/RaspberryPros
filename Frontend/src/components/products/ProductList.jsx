const currencyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
})

function getStockStatus(stock) {
  if (stock === 0) {
    return { label: 'Sin existencias', className: 'stock-badge--empty' }
  }

  if (stock <= 5) {
    return { label: 'Stock bajo', className: 'stock-badge--low' }
  }

  return { label: 'Disponible', className: 'stock-badge--available' }
}

function ProductList({ products, isAdmin, onEdit }) {
  return (
    <div className="products-table-wrap">
      <table className="products-table">
        <caption className="visually-hidden">Listado de productos de demostración</caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col">Precio</th>
            <th scope="col">Stock</th>
            <th scope="col">Estado</th>
            {isAdmin && <th scope="col">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock)

            return (
              <tr key={product.id} className={product.activo ? '' : 'product-row--inactive'}>
                <td data-label="Producto">
                  <div className="product-cell">
                    <strong>{product.nombre}</strong>
                    <span>{product.descripcion || 'Sin descripción'}</span>
                  </div>
                </td>
                <td data-label="Categoría">
                  <span className="category-badge">{product.categoria}</span>
                </td>
                <td data-label="Precio" className="product-price">
                  {currencyFormatter.format(product.precio)}
                </td>
                <td data-label="Stock">
                  <div className="stock-cell">
                    <span className={`stock-badge ${stockStatus.className}`}>
                      {stockStatus.label}
                    </span>
                    <small>{product.stock} unidades</small>
                  </div>
                </td>
                <td data-label="Estado">
                  <span
                    className={`status-badge ${
                      product.activo ? 'status-badge--active' : 'status-badge--inactive'
                    }`}
                  >
                    {product.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {isAdmin && (
                  <td data-label="Acciones">
                    <button
                      className="table-action"
                      type="button"
                      aria-label={`Editar ${product.nombre}`}
                      onClick={() => onEdit(product)}
                    >
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProductList
