const ventasRepository = require('../repositories/ventas.repository');
const authClient = require('../clients/auth.client');
const productsClient = require('../clients/products.client');
const { AppError } = require('../utils/errors');

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function ensureProductCanBeSold(product, cantidad) {
  if (!product.isActive) {
    throw new AppError(409, `Product ${product.id} is not active`, 'PRODUCT_NOT_AVAILABLE');
  }

  if (product.stock !== null && product.stock !== undefined && Number(product.stock) < cantidad) {
    throw new AppError(409, `Product ${product.id} does not have enough stock`, 'INSUFFICIENT_STOCK');
  }
}

async function registerSale({ idUsuario, productos }, authorization) {
  await authClient.getUserById(idUsuario, authorization);

  const detalles = [];
  for (const item of productos) {
    const product = await productsClient.getProductById(item.idProducto);
    ensureProductCanBeSold(product, item.cantidad);

    const subtotal = roundMoney(product.precio * item.cantidad);
    detalles.push({
      idProducto: item.idProducto,
      nombreProducto: product.nombre,
      cantidad: item.cantidad,
      precioUnitario: product.precio,
      subtotal
    });
  }

  const total = roundMoney(detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0));
  return ventasRepository.createSale({ idUsuario, total, detalles });
}

async function listSales() {
  return ventasRepository.listSales();
}

async function getSaleById(id) {
  const sale = await ventasRepository.findSaleById(id);
  if (!sale) throw new AppError(404, 'Sale not found', 'SALE_NOT_FOUND');
  return sale;
}

async function cancelSale(id) {
  const sale = await ventasRepository.cancelSale(id);
  if (!sale) throw new AppError(404, 'Sale not found', 'SALE_NOT_FOUND');
  return sale;
}

module.exports = { registerSale, listSales, getSaleById, cancelSale };
