const { AppError } = require('../utils/errors');

function parsePositiveInteger(value, field) {
  const text = String(value);
  if (!/^\d+$/.test(text) || Number(text) < 1) {
    throw new AppError(400, `${field} must be a positive integer`, 'VALIDATION_ERROR');
  }
  return Number(text);
}

function getFirstDefined(body, keys) {
  return keys.map((key) => body[key]).find((value) => value !== undefined);
}

function validateCreateSale(body = {}) {
  const idUsuario = parsePositiveInteger(
    getFirstDefined(body, ['idUsuario', 'id_usuario', 'userId']),
    'idUsuario'
  );
  const productos = getFirstDefined(body, ['productos', 'items', 'detalles']);
  const errors = [];

  if (!Array.isArray(productos) || productos.length === 0) {
    errors.push('productos must be a non-empty array');
  }

  const normalizedProducts = Array.isArray(productos)
    ? productos.map((producto, index) => {
        try {
          if (!producto || typeof producto !== 'object') {
            throw new AppError(400, `productos[${index}] must be an object`, 'VALIDATION_ERROR');
          }

          return {
            idProducto: parsePositiveInteger(
              getFirstDefined(producto, ['idProducto', 'id_producto', 'productId']),
              `productos[${index}].idProducto`
            ),
            cantidad: parsePositiveInteger(producto.cantidad, `productos[${index}].cantidad`)
          };
        } catch (error) {
          if (error instanceof AppError) errors.push(error.message);
          else throw error;
          return null;
        }
      }).filter(Boolean)
    : [];

  if (errors.length > 0) throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
  return { idUsuario, productos: normalizedProducts };
}

function parseSaleId(value) {
  return parsePositiveInteger(value, 'id');
}

module.exports = { validateCreateSale, parseSaleId };
