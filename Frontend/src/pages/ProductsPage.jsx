import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader.jsx'
import ProductFormModal from '../components/products/ProductFormModal.jsx'
import ProductList from '../components/products/ProductList.jsx'
import useAuth from '../context/useAuth.js'
import {
  createProduct,
  getProducts,
  updateProduct,
} from '../services/productService.js'

function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const isAdmin = Array.isArray(user?.roles) && user.roles.includes('admin')

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const productList = await getProducts()
      setProducts(productList)
    } catch {
      setLoadError('No fue posible cargar los productos de demostración.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getProducts()
      .then((productList) => {
        if (isCurrent) setProducts(productList)
      })
      .catch(() => {
        if (isCurrent) {
          setLoadError('No fue posible cargar los productos de demostración.')
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const categories = useMemo(
    () =>
      [...new Set(products.map(({ categoria }) => categoria))].sort((first, second) =>
        first.localeCompare(second, 'es'),
      ),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es')

    return products.filter((product) => {
      const matchesName = product.nombre.toLocaleLowerCase('es').includes(normalizedSearch)
      const matchesCategory =
        categoryFilter === 'all' || product.categoria === categoryFilter
      return matchesName && matchesCategory
    })
  }, [categoryFilter, products, searchTerm])

  const closeModal = useCallback(() => {
    if (isSaving) return
    setIsModalOpen(false)
    setSelectedProduct(null)
    setSaveError('')
  }, [isSaving])

  const openNewProduct = () => {
    setSelectedProduct(null)
    setSaveError('')
    setIsModalOpen(true)
  }

  const openEditProduct = (product) => {
    setSelectedProduct(product)
    setSaveError('')
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (productData) => {
    setIsSaving(true)
    setSaveError('')

    try {
      if (selectedProduct) {
        const updatedProduct = await updateProduct(selectedProduct.id, productData)
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          ),
        )
      } else {
        const createdProduct = await createProduct(productData)
        setProducts((currentProducts) => [createdProduct, ...currentProducts])
      }

      setIsModalOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el producto de demostración.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
  }

  return (
    <div className="page products-page">
      <div className="products-heading">
        <PageHeader
          eyebrow="Inventario"
          title="Productos"
          description="Consulta y administra el catálogo provisional de productos."
        />

        {isAdmin && (
          <button className="primary-button products-heading__action" type="button" onClick={openNewProduct}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo producto
          </button>
        )}
      </div>

      <aside className="mock-notice" aria-label="Información sobre los datos">
        <span aria-hidden="true">M</span>
        <p>
          <strong>Datos de demostración.</strong> Los cambios son locales y se restauran al
          recargar la aplicación.
        </p>
      </aside>

      <section className="products-panel" aria-labelledby="products-list-title">
        <h2 className="visually-hidden" id="products-list-title">
          Catálogo de productos
        </h2>

        <div className="products-toolbar">
          <div className="filter-field filter-field--search">
            <label htmlFor="product-search">Buscar por nombre</label>
            <div className="search-control">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" />
              </svg>
              <input
                id="product-search"
                type="search"
                value={searchTerm}
                placeholder="Ej. teclado"
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="category-filter">Categoría</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-results" aria-live="polite">
          <p>
            <strong>{filteredProducts.length}</strong>{' '}
            {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
          <span>Modelo mock provisional</span>
        </div>

        {isLoading && (
          <div className="products-state" aria-live="polite" aria-busy="true">
            <span className="products-state__spinner" aria-hidden="true" />
            <h3>Cargando productos</h3>
            <p>Preparando el catálogo de demostración…</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="products-state products-state--error" role="alert">
            <h3>No se pudo cargar el catálogo</h3>
            <p>{loadError}</p>
            <button className="secondary-button" type="button" onClick={loadProducts}>
              Intentar nuevamente
            </button>
          </div>
        )}

        {!isLoading && !loadError && filteredProducts.length === 0 && (
          <div className="products-state">
            <h3>Sin resultados</h3>
            <p>No hay productos que coincidan con la búsqueda y categoría seleccionadas.</p>
            <button className="secondary-button" type="button" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        )}

        {!isLoading && !loadError && filteredProducts.length > 0 && (
          <ProductList products={filteredProducts} isAdmin={isAdmin} onEdit={openEditProduct} />
        )}
      </section>

      {isModalOpen && (
        <ProductFormModal
          key={selectedProduct?.id ?? 'new-product'}
          product={selectedProduct}
          categories={categories}
          isSaving={isSaving}
          saveError={saveError}
          onClose={closeModal}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  )
}

export default ProductsPage
