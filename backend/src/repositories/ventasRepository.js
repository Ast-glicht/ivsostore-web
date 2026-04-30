const { getConnection, sql } = require('../config/db');

async function listarPedidosVenta() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT 
      p.IDpedido AS idPedido,
      c.Nombre AS cliente,
      v.NombreVendedor AS vendedor,
      p.FechaPedido AS fechaPedido,
      p.Estado AS estado,
      p.montototal AS montoTotal
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
        dp.precioventa AS precioUnitario,
        (dp.Cantidad * dp.precioventa) AS subtotal
      FROM detalle_Pedidos dp
      INNER JOIN Inventario i ON i.IDproducto = dp.IDproducto
      WHERE dp.IDpedido = @idPedido
    `);

  return result.recordset;
}

async function obtenerDatosFactura(idPedido) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('idPedido', sql.Int, idPedido)
    .query(`
      SELECT 
        IDpedido,
        Cliente,
        NombreVendedor,
        FechaPedido,
        NombreProducto,
        Cantidad,
        PrecioUnitario,
        Subtotal,
        TotalPedido
      FROM vista_factura_por_pedido
      WHERE IDpedido = @idPedido
    `);

  return result.recordset;
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
module.exports = {
  listarPedidosVenta,
  obtenerProductosPedido,
  obtenerDatosFactura,
  actualizarEstadoPedido
};