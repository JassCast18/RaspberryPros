import { pool } from "../config/database.js";

// Listar todos los productos
export const listarProductos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nombre,
        descripcion,
        precio::float8 AS precio,
        stock,
        categoria,
        activo,
        fecha_creacion,
        fecha_actualizacion
      FROM productos
      ORDER BY id ASC
    `);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error("Error al listar productos:", error.message);

    res.status(500).json({
      mensaje: "Error al obtener los productos"
    });
  }
};

// Obtener un producto por ID
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      SELECT
        id,
        nombre,
        descripcion,
        precio::float8 AS precio,
        stock,
        categoria,
        activo,
        fecha_creacion,
        fecha_actualizacion
      FROM productos
      WHERE id = $1
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error.message);

    res.status(500).json({
      mensaje: "Error al obtener el producto"
    });
  }
};

// Crear un nuevo producto
export const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion = "",
      precio,
      stock = 0,
      categoria,
      activo = true
    } = req.body;

    if (!nombre || precio === undefined || !categoria) {
      return res.status(400).json({
        mensaje: "Nombre, precio y categoría son obligatorios"
      });
    }

    if (Number(precio) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        mensaje: "El precio y el stock no pueden ser negativos"
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO productos
      (
        nombre,
        descripcion,
        precio,
        stock,
        categoria,
        activo
      )
      VALUES ($1, $2, $3, $4, $5, $6)

      RETURNING
        id,
        nombre,
        descripcion,
        precio::float8 AS precio,
        stock,
        categoria,
        activo,
        fecha_creacion,
        fecha_actualizacion
      `,
      [
        nombre,
        descripcion,
        precio,
        stock,
        categoria,
        activo
      ]
    );

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message);

    res.status(500).json({
      mensaje: "Error al crear el producto"
    });
  }
};

// Actualizar un producto
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      activo
    } = req.body;

    if (!nombre || precio === undefined || stock === undefined || !categoria) {
      return res.status(400).json({
        mensaje: "Nombre, precio, stock y categoría son obligatorios"
      });
    }

    if (Number(precio) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        mensaje: "El precio y el stock no pueden ser negativos"
      });
    }

    const resultado = await pool.query(
      `
      UPDATE productos
      SET
        nombre = $1,
        descripcion = $2,
        precio = $3,
        stock = $4,
        categoria = $5,
        activo = $6,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $7

      RETURNING
        id,
        nombre,
        descripcion,
        precio::float8 AS precio,
        stock,
        categoria,
        activo,
        fecha_creacion,
        fecha_actualizacion
      `,
      [
        nombre,
        descripcion || "",
        precio,
        stock,
        categoria,
        activo ?? true,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Producto actualizado correctamente",
      producto: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);

    res.status(500).json({
      mensaje: "Error al actualizar el producto"
    });
  }
};

// Desactivar un producto
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `
      UPDATE productos
      SET
        activo = FALSE,
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, nombre, activo
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    res.status(200).json({
      mensaje: "Producto desactivado correctamente",
      producto: resultado.rows[0]
    });
  } catch (error) {
    console.error("Error al desactivar producto:", error.message);

    res.status(500).json({
      mensaje: "Error al desactivar el producto"
    });
  }
};
