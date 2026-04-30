const { getConnection, sql } = require('../config/db');

async function obtenerReporteVentasPorFechas(fechaInicio, fechaFin) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaFin', sql.Date, fechaFin)
    .query(`
      SELECT
        p.IDpedido AS idPedido,
        p.FechaPedido AS fechaPedido,
        c.Nombre AS cliente,
        v.NombreVendedor AS vendedor,
        i.NombreProducto AS producto,
        pr.NombreProveedor AS proveedor,
        dp.Cantidad AS cantidad,
        dp.PrecioUnitario AS precioUnitario,
        dp.precioventa AS precioVenta,
        (dp.Cantidad * dp.PrecioUnitario) AS costoTotal,
        (dp.Cantidad * dp.precioventa) AS ventaTotal,
        ((dp.Cantidad * dp.precioventa) - (dp.Cantidad * dp.PrecioUnitario)) AS ganancia
      FROM pedidos p
      INNER JOIN detalle_pedidos dp ON p.IDpedido = dp.IDpedido
      INNER JOIN inventario i ON dp.IDproducto = i.IDproducto
      LEFT JOIN proveedores pr ON i.idProveedor = pr.idProveedor
      INNER JOIN clientes c ON p.Clienteid = c.IDcliente
      INNER JOIN vendedores v ON p.IdVendedor = v.IDvendedor
      WHERE CAST(p.FechaPedido AS DATE) BETWEEN @fechaInicio AND @fechaFin
      ORDER BY ganancia DESC
    `);

  return result.recordset;
}

module.exports = {
  obtenerReporteVentasPorFechas
};