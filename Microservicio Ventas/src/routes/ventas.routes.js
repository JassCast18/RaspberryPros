const express = require('express');
const ventasController = require('../controllers/ventas.controller');
const { asyncHandler } = require('../utils/async-handler');

const router = express.Router();

router.get('/', asyncHandler(ventasController.list));
router.post('/', asyncHandler(ventasController.create));
router.get('/:id', asyncHandler(ventasController.getById));
router.patch('/:id/anular', asyncHandler(ventasController.cancel));

module.exports = router;
