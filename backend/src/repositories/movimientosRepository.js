const { getConnection, sql } = require('../config/db');

async function listarMovimientos() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      h.IDmovimiento AS idmovimiento,
      h.IDproducto AS idproducto,
      i.NombreProducto AS nombreProducto,
      h.TipoMovimiento AS tipoMovimiento,
      h.Cantidad AS cantidad,
      h.Motivo AS motivo,
      h.FechaMovimiento AS fechaMovimiento,
      h.Usuario AS usuario
    FROM historial_movimientos_productos h
    INNER JOIN inventario i ON h.IDproducto = i.IDproducto
    ORDER BY h.FechaMovimiento DESC
  `);

  return result.recordset;
}

async function registrarMovimiento({ idproducto, tipoMovimiento, cantidad, motivo, usuario }) {
  const pool = await getConnection();

  await pool.request()
    .input('idproducto', sql.Int, idproducto)
    .input('tipoMovimiento', sql.VarChar, tipoMovimiento)
    .input('cantidad', sql.Int, cantidad)
    .input('motivo', sql.VarChar, motivo || null)
    .input('usuario', sql.VarChar, usuario || null)
    .query(`
      INSERT INTO historial_movimientos_productos
      (IDproducto, TipoMovimiento, Cantidad, Motivo, Usuario)
      VALUES
      (@idproducto, @tipoMovimiento, @cantidad, @motivo, @usuario)
    `);
}

module.exports = {
  listarMovimientos,
  registrarMovimiento
};