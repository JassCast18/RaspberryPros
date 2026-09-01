import { useEffect, useRef, useState } from 'react'

function getInitialValues(product) {
  return {
    nombre: product?.nombre ?? '',
    descripcion: product?.descripcion ?? '',
    categoria: product?.categoria ?? '',
    precio: product?.precio?.toString() ?? '',
    stock: product?.stock?.toString() ?? '',
    activo: product?.activo ?? true,
  }
}

function validateProduct(values) {
  const errors = {}
  const price = Number(values.precio)
  const stock = Number(values.stock)

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.'
  }

  if (!values.categoria.trim()) {
    errors.categoria = 'La categoría es obligatoria.'
  }

  if (values.precio === '' || !Number.isFinite(price) || price < 0) {
    errors.precio = 'El precio debe ser un número mayor o igual a cero.'
  }

  if (values.stock === '' || !Number.isInteger(stock) || stock < 0) {
    errors.stock = 'El stock debe ser un número entero mayor o igual a cero.'
  }

  return errors
}

function ProductFormModal({ product, categories, isSaving, saveError, onClose, onSave }) {
  const [values, setValues] = useState(() => getInitialValues(product))
  const [errors, setErrors] = useState({})
  const modalRef = useRef(null)
  const nameInputRef = useRef(null)
  const isEditing = Boolean(product)

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement
    nameInputRef.current?.focus()

    return () => previouslyFocusedElement?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose()
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSaving, onClose])

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSaving) return

    const validationErrors = validateProduct(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    await onSave({
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
      categoria: values.categoria.trim(),
      precio: Number(values.precio),
      stock: Number(values.stock),
      activo: values.activo,
    })
  }

  return (
    <div className="modal-backdrop">
      <section
        ref={modalRef}
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        aria-describedby="product-form-note"
      >
        <header className="product-modal__header">
          <div>
            <p>Datos provisionales</p>
            <h2 id="product-form-title">
              {isEditing ? 'Editar producto' : 'Nuevo producto'}
            </h2>
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Cerrar formulario"
            disabled={isSaving}
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <p className="product-modal__note" id="product-form-note">
          Los cambios se conservan únicamente durante esta ejecución.
        </p>

        <form className="product-form" onSubmit={handleSubmit} noValidate>
          <div className="product-form__grid">
            <div className="product-field product-field--full">
              <label htmlFor="product-name">Nombre</label>
              <input
                ref={nameInputRef}
                id="product-name"
                name="nombre"
                type="text"
                value={values.nombre}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={errors.nombre ? 'product-name-error' : undefined}
                disabled={isSaving}
                onChange={handleChange}
              />
              {errors.nombre && (
                <small id="product-name-error" className="field-error">
                  {errors.nombre}
                </small>
              )}
            </div>

            <div className="product-field product-field--full">
              <label htmlFor="product-description">Descripción</label>
              <textarea
                id="product-description"
                name="descripcion"
                value={values.descripcion}
                rows="3"
                disabled={isSaving}
                onChange={handleChange}
              />
            </div>

            <div className="product-field product-field--full">
              <label htmlFor="product-category">Categoría</label>
              <input
                id="product-category"
                name="categoria"
                type="text"
                list="product-category-options"
                placeholder="Selecciona una categoría"
                value={values.categoria}
                aria-invalid={Boolean(errors.categoria)}
                aria-describedby={errors.categoria ? 'product-category-error' : undefined}
                disabled={isSaving}
                onChange={handleChange}
              />
              <datalist id="product-category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {errors.categoria && (
                <small id="product-category-error" className="field-error">
                  {errors.categoria}
                </small>
              )}
            </div>

            <div className="product-field">
              <label htmlFor="product-price">Precio (GTQ)</label>
              <input
                id="product-price"
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={values.precio}
                aria-invalid={Boolean(errors.precio)}
                aria-describedby={errors.precio ? 'product-price-error' : undefined}
                disabled={isSaving}
                onChange={handleChange}
              />
              {errors.precio && (
                <small id="product-price-error" className="field-error">
                  {errors.precio}
                </small>
              )}
            </div>

            <div className="product-field">
              <label htmlFor="product-stock">Stock</label>
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={values.stock}
                aria-invalid={Boolean(errors.stock)}
                aria-describedby={errors.stock ? 'product-stock-error' : undefined}
                disabled={isSaving}
                onChange={handleChange}
              />
              {errors.stock && (
                <small id="product-stock-error" className="field-error">
                  {errors.stock}
                </small>
              )}
            </div>

            <label className="product-toggle product-field--full">
              <input
                name="activo"
                type="checkbox"
                checked={values.activo}
                disabled={isSaving}
                onChange={handleChange}
              />
              <span>
                Producto activo
                <small>Estado local provisional; deberá adaptarse al backend.</small>
              </span>
            </label>
          </div>

          {saveError && (
            <p className="product-form__error" role="alert">
              {saveError}
            </p>
          )}

          <footer className="product-modal__footer">
            <button
              className="secondary-button"
              type="button"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default ProductFormModal
