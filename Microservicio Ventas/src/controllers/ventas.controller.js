const ventasService = require('../services/ventas.service');
const { validateCreateSale, parseSaleId } = require('../validators/ventas.validator');

async function create(request, response) {
  const data = validateCreateSale(request.body);
  const sale = await ventasService.registerSale(data, request.get('authorization'));
  return response.status(201).json(sale);
}

async function list(_request, response) {
  const ventas = await ventasService.listSales();
  return response.status(200).json({ ventas });
}

async function getById(request, response) {
  const id = parseSaleId(request.params.id);
  const sale = await ventasService.getSaleById(id);
  return response.status(200).json(sale);
}

async function cancel(request, response) {
  const id = parseSaleId(request.params.id);
  const sale = await ventasService.cancelSale(id);
  return response.status(200).json(sale);
}

module.exports = { create, list, getById, cancel };
