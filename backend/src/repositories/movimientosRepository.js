const { getConnection, sql } = require('../config/db');

async function listarMovimientos() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      h.IDmovimiento AS idmovimiento,
      h.IDproducto AS idproducto,
      i.NombreProducto AS nombreProducto,
      h.CodigoProducto AS codigoProducto,
      h.IDpedido AS idPedido,
      h.Cliente AS cliente,
      h.TipoMovimiento AS tipoMovimiento,
      h.Cantidad AS cantidad,
      h.PrecioUnitario AS precioUnitario,
      h.PrecioVenta AS precioVenta,
      h.StockAnterior AS stockAnterior,
      h.StockNuevo AS stockNuevo,
      h.Motivo AS motivo,
      h.FechaMovimiento AS fechaMovimiento,
      h.Usuario AS usuario
    FROM historial_movimientos_productos h
    INNER JOIN inventario i ON h.IDproducto = i.IDproducto
    ORDER BY h.FechaMovimiento DESC, h.IDmovimiento DESC
  `);

  return result.recordset;
}

async function registrarMovimiento({
  idproducto,
  tipoMovimiento,
  cantidad,
  motivo,
  usuario,
  idPedido = null,
  cliente = null,
  precioUnitario = null,
  precioVenta = null,
  stockAnterior = null,
  stockNuevo = null,
  codigoProducto = null
}) {
  const pool = await getConnection();

  await pool.request()
    .input('idproducto', sql.Int, idproducto)
    .input('tipoMovimiento', sql.VarChar, tipoMovimiento)
    .input('cantidad', sql.Int, cantidad)
    .input('motivo', sql.VarChar, motivo || null)
    .input('usuario', sql.VarChar, usuario || 'Sistema')
    .input('idPedido', sql.Int, idPedido)
    .input('cliente', sql.VarChar, cliente)
    .input('precioUnitario', sql.Decimal(18, 2), precioUnitario)
    .input('precioVenta', sql.Decimal(18, 2), precioVenta)
    .input('stockAnterior', sql.Int, stockAnterior)
    .input('stockNuevo', sql.Int, stockNuevo)
    .input('codigoProducto', sql.VarChar, codigoProducto)
    .query(`
      INSERT INTO historial_movimientos_productos
      (
        IDproducto,
        TipoMovimiento,
        Cantidad,
        Motivo,
        FechaMovimiento,
        Usuario,
        IDpedido,
        Cliente,
        PrecioUnitario,
        PrecioVenta,
        StockAnterior,
        StockNuevo,
        CodigoProducto
      )
      VALUES
      (
        @idproducto,
        @tipoMovimiento,
        @cantidad,
        @motivo,
        GETDATE(),
        @usuario,
        @idPedido,
        @cliente,
        @precioUnitario,
        @precioVenta,
        @stockAnterior,
        @stockNuevo,
        @codigoProducto
      )
    `);
}

module.exports = {
  listarMovimientos,
  registrarMovimiento
};