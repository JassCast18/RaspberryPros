const { productsApiUrl } = require('../config/services');
const { requestJson } = require('./http.client');
const { AppError } = require('../utils/errors');

function pickProduct(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return payload.producto || payload.product || payload;
}

function normalizePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

async function getProductById(idProducto) {
  const payload = await requestJson(`${productsApiUrl}/api/productos/${idProducto}`);
  const product = pickProduct(payload);
  if (!product) throw new AppError(502, 'Product API did not return product data', 'PRODUCT_DATA_MISSING');

  const price = normalizePrice(product.precio ?? product.price ?? product.precioUnitario);

  if (price === null) {
    throw new AppError(502, 'Product API did not return a valid price', 'PRODUCT_PRICE_MISSING');
  }

  return {
    id: Number(product.id ?? product.idProducto ?? idProducto),
    nombre: product.nombre ?? product.name ?? null,
    precio: price,
    stock: product.stock ?? product.existencias ?? null,
    isActive: product.isActive ?? product.activo ?? product.estado !== 'inactivo'
  };
}

module.exports = { getProductById };
