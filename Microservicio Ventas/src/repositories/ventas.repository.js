const { pool } = require('../config/database');

function mapSale(row, detalles = []) {
  if (!row) return null;
  return {
    id: row.id,
    idUsuario: row.idUsuario,
    total: Number(row.total),
    estado: row.estado,
    fecha: row.fecha,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    detalles
  };
}

function mapDetail(row) {
  return {
    id: row.id,
    ventaId: row.ventaId,
    idProducto: row.idProducto,
    nombreProducto: row.nombreProducto,
    cantidad: row.cantidad,
    precioUnitario: Number(row.precioUnitario),
    subtotal: Number(row.subtotal),
    createdAt: row.createdAt
  };
}

async function createSale({ idUsuario, total, detalles }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ventaResult = await client.query(
      `INSERT INTO ventas (id_usuario, total)
       VALUES ($1, $2)
       RETURNING id`,
      [idUsuario, total]
    );
    const ventaId = ventaResult.rows[0].id;

    for (const detalle of detalles) {
      await client.query(
        `INSERT INTO detalle_venta
          (venta_id, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          ventaId,
          detalle.idProducto,
          detalle.nombreProducto,
          detalle.cantidad,
          detalle.precioUnitario,
          detalle.subtotal
        ]
      );
    }

    await client.query('COMMIT');
    return findSaleById(ventaId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findSaleById(id) {
  const ventaResult = await pool.query(
    `SELECT id, id_usuario AS "idUsuario", total, estado, fecha,
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM ventas
     WHERE id = $1`,
    [id]
  );
  const venta = ventaResult.rows[0];
  if (!venta) return null;

  const detallesResult = await pool.query(
    `SELECT id, venta_id AS "ventaId", id_producto AS "idProducto",
            nombre_producto AS "nombreProducto", cantidad,
            precio_unitario AS "precioUnitario", subtotal,
            created_at AS "createdAt"
     FROM detalle_venta
     WHERE venta_id = $1
     ORDER BY id ASC`,
    [id]
  );

  return mapSale(venta, detallesResult.rows.map(mapDetail));
}

async function listSales() {
  const ventasResult = await pool.query(
    `SELECT id, id_usuario AS "idUsuario", total, estado, fecha,
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM ventas
     ORDER BY fecha DESC, id DESC`
  );

  if (ventasResult.rows.length === 0) return [];

  const ids = ventasResult.rows.map((venta) => venta.id);
  const detallesResult = await pool.query(
    `SELECT id, venta_id AS "ventaId", id_producto AS "idProducto",
            nombre_producto AS "nombreProducto", cantidad,
            precio_unitario AS "precioUnitario", subtotal,
            created_at AS "createdAt"
     FROM detalle_venta
     WHERE venta_id = ANY($1::bigint[])
     ORDER BY id ASC`,
    [ids]
  );

  const detallesBySaleId = detallesResult.rows.reduce((accumulator, row) => {
    const ventaId = String(row.ventaId);
    if (!accumulator[ventaId]) accumulator[ventaId] = [];
    accumulator[ventaId].push(mapDetail(row));
    return accumulator;
  }, {});

  return ventasResult.rows.map((venta) => mapSale(venta, detallesBySaleId[String(venta.id)] || []));
}

async function cancelSale(id) {
  const result = await pool.query(
    `UPDATE ventas
     SET estado = 'anulada'
     WHERE id = $1 AND estado <> 'anulada'
     RETURNING id`,
    [id]
  );

  if (result.rowCount === 0) return findSaleById(id);
  return findSaleById(result.rows[0].id);
}

module.exports = { createSale, findSaleById, listSales, cancelSale };
