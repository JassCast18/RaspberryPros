import { Router } from "express";

import {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productController.js";

const router = Router();

// Listar todos los productos
router.get("/", listarProductos);

// Obtener producto por ID
router.get("/:id", obtenerProductoPorId);

// Crear producto
router.post("/", crearProducto);

// Actualizar producto
router.put("/:id", actualizarProducto);

// Desactivar producto
router.delete("/:id", eliminarProducto);

export default router;
