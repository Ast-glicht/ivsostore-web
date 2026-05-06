const { getConnection, sql } = require('../config/db');

async function listarPedidos() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      p.IDpedido AS idPedido,
      c.Nombre AS cliente,
      v.NombreVendedor AS vendedor,
      p.FechaPedido AS fechaPedido,
      p.Estado AS estado,
      p.MontoTotal AS montoTotal,
      ISNULL(p.DescuentoPorcentaje, 0) AS descuentoPorcentaje,
      ISNULL(p.DescuentoMonto, 0) AS descuentoMonto,
      ISNULL(p.TotalConDescuento, p.MontoTotal) AS totalConDescuento,
      ISNULL(p.Moneda, 'NIO') AS moneda,
      p.TipoCambio AS tipoCambio
    FROM pedidos p
    INNER JOIN clientes c ON p.Clienteid = c.IDcliente
    INNER JOIN vendedores v ON p.IdVendedor = v.IDvendedor
    ORDER BY p.IDpedido DESC
  `);

  return result.recordset;
}

async function obtenerProductosPedido(idPedido) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('idPedido', sql.Int, idPedido)
    .query(`
      SELECT
        dp.IDproducto AS idProducto,
        i.NombreProducto AS nombreProducto,
        dp.Cantidad AS cantidad,
        dp.PrecioUnitario AS precioUnitario,
        dp.PrecioVenta AS precioVenta,
        (dp.Cantidad * dp.PrecioVenta) AS subtotal
      FROM detalle_pedidos dp
      INNER JOIN inventario i ON i.IDproducto = dp.IDproducto
      WHERE dp.IDpedido = @idPedido
    `);

  return result.recordset;
}

async function obtenerPedidoPorId(idPedido) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('idPedido', sql.Int, idPedido)
    .query(`
      SELECT
        p.IDpedido AS idPedido,
        c.Nombre AS cliente,
        v.NombreVendedor AS vendedor,
        p.FechaPedido AS fechaPedido,
        p.Estado AS estado,
        p.MontoTotal AS montoTotal,
        ISNULL(p.DescuentoPorcentaje, 0) AS descuentoPorcentaje,
        ISNULL(p.DescuentoMonto, 0) AS descuentoMonto,
        ISNULL(p.TotalConDescuento, p.MontoTotal) AS totalConDescuento,
        ISNULL(p.Moneda, 'NIO') AS moneda,
        p.TipoCambio AS tipoCambio
      FROM pedidos p
      INNER JOIN clientes c ON p.Clienteid = c.IDcliente
      INNER JOIN vendedores v ON p.IdVendedor = v.IDvendedor
      WHERE p.IDpedido = @idPedido
    `);

  return result.recordset[0] || null;
}

async function actualizarEstadoPedido(idPedido, estado) {
  const pool = await getConnection();

  await pool.request()
    .input('idPedido', sql.Int, idPedido)
    .input('estado', sql.VarChar, estado)
    .query(`
      UPDATE pedidos
      SET Estado = @estado
      WHERE IDpedido = @idPedido
    `);
}

async function actualizarConfiguracionVenta({
  idPedido,
  descuentoPorcentaje,
  descuentoMonto,
  totalConDescuento,
  moneda,
  tipoCambio
}) {
  const pool = await getConnection();

  await pool.request()
    .input('idPedido', sql.Int, idPedido)
    .input('descuentoPorcentaje', sql.Decimal(5, 2), descuentoPorcentaje)
    .input('descuentoMonto', sql.Decimal(18, 2), descuentoMonto)
    .input('totalConDescuento', sql.Decimal(18, 2), totalConDescuento)
    .input('moneda', sql.VarChar, moneda)
    .input('tipoCambio', sql.Decimal(18, 4), tipoCambio || null)
    .query(`
      UPDATE pedidos
      SET
        DescuentoPorcentaje = @descuentoPorcentaje,
        DescuentoMonto = @descuentoMonto,
        TotalConDescuento = @totalConDescuento,
        Moneda = @moneda,
        TipoCambio = @tipoCambio
      WHERE IDpedido = @idPedido
    `);
}

async function obtenerDatosFactura(idPedido) {
  const pedido = await obtenerPedidoPorId(idPedido);
  const productos = await obtenerProductosPedido(idPedido);

  if (!pedido) return null;

  return {
    pedido,
    productos
  };
}

module.exports = {
  listarPedidos,
  obtenerProductosPedido,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  actualizarConfiguracionVenta,
  obtenerDatosFactura
};