const { getConnection, sql } = require('../config/db');

async function obtenerReporteVentas(fechaInicio, fechaFin) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaFin', sql.Date, fechaFin)
    .query(`
      SELECT
        p.IDpedido AS idPedido,
        p.FechaPedido AS fechaPedido,
        c.Nombre AS cliente,
        ISNULL(c.Empresa, '') AS empresa,
        v.NombreVendedor AS vendedor,
        p.Estado AS estado,
        p.MontoTotal AS montoTotal,
        ISNULL(p.DescuentoPorcentaje, 0) AS descuentoPorcentaje,
        ISNULL(p.DescuentoMonto, 0) AS descuentoMonto,
        ISNULL(p.TotalConDescuento, p.MontoTotal) AS totalConDescuento,
        ISNULL(p.Moneda, 'NIO') AS moneda,
        p.TipoCambio AS tipoCambio
      FROM pedidos p
      INNER JOIN Clientes c ON p.Clienteid = c.IDCliente
      INNER JOIN Vendedores v ON p.IDVendedor = v.IDVendedor
      WHERE p.FechaPedido >= @fechaInicio
        AND p.FechaPedido < DATEADD(DAY, 1, @fechaFin)
      ORDER BY p.FechaPedido DESC, p.IDpedido DESC
    `);

  return result.recordset;
}

async function obtenerReporteInventario(fechaInicio, fechaFin) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaFin', sql.Date, fechaFin)
    .query(`
      SELECT
        i.IDproducto AS idProducto,
        i.NombreProducto AS nombreProducto,
        i.Descripcion AS descripcion,
        i.Codigo AS codigo,
        i.Precio AS precio,
        i.Stock AS stock,
        i.FechaDeCompra AS fechaDeCompra,
        i.FechaVencimiento AS fechaVencimiento,
        ISNULL(p.NombreProveedor, '') AS proveedor,
        ISNULL(p.NumeroProveedor, '') AS numeroProveedor,
        CASE
          WHEN i.Stock = 0 THEN 'Agotado'
          WHEN i.Stock > 0 AND i.Stock < 10 THEN 'Stock bajo'
          ELSE 'Stock normal'
        END AS estadoStock,
        (i.Precio * i.Stock) AS valorInventario
      FROM inventario i
      LEFT JOIN proveedores p ON i.idProveedor = p.idProveedor
      WHERE i.FechaDeCompra >= @fechaInicio
        AND i.FechaDeCompra < DATEADD(DAY, 1, @fechaFin)
      ORDER BY
        CASE
          WHEN i.Stock = 0 THEN 1
          WHEN i.Stock > 0 AND i.Stock < 10 THEN 2
          ELSE 3
        END,
        i.Stock ASC,
        i.NombreProducto ASC
    `);

  return result.recordset;
}

async function obtenerReporteClientes(fechaInicio, fechaFin) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('fechaInicio', sql.Date, fechaInicio)
    .input('fechaFin', sql.Date, fechaFin)
    .query(`
      SELECT
        c.IDCliente AS idCliente,
        c.Nombre AS cliente,
        ISNULL(c.Empresa, '') AS empresa,
        ISNULL(c.Telefono, '') AS telefono,
        ISNULL(c.Departamento, '') AS departamento,
        ISNULL(c.Municipio, '') AS municipio,
        ISNULL(c.Barrio, '') AS barrio,
        ISNULL(c.DetalleDireccion, '') AS detalleDireccion,
        ISNULL(c.Cobertura, '') AS cobertura,
        COUNT(p.IDpedido) AS cantidadPedidos,
        ISNULL(SUM(ISNULL(p.TotalConDescuento, p.MontoTotal)), 0) AS totalComprado,
        MAX(p.FechaPedido) AS ultimaCompra,
        CASE
          WHEN COUNT(p.IDpedido) >= 5 THEN 'Cliente frecuente'
          WHEN COUNT(p.IDpedido) BETWEEN 2 AND 4 THEN 'Cliente recurrente'
          WHEN COUNT(p.IDpedido) = 1 THEN 'Cliente ocasional'
          ELSE 'Sin compras en el rango'
        END AS frecuencia
      FROM Clientes c
      LEFT JOIN pedidos p
        ON p.Clienteid = c.IDCliente
        AND p.FechaPedido >= @fechaInicio
        AND p.FechaPedido < DATEADD(DAY, 1, @fechaFin)
      GROUP BY
        c.IDCliente,
        c.Nombre,
        c.Empresa,
        c.Telefono,
        c.Departamento,
        c.Municipio,
        c.Barrio,
        c.DetalleDireccion,
        c.Cobertura
      ORDER BY
        COUNT(p.IDpedido) DESC,
        ISNULL(SUM(ISNULL(p.TotalConDescuento, p.MontoTotal)), 0) DESC,
        c.Nombre ASC
    `);

  return result.recordset;
}

module.exports = {
  obtenerReporteVentas,
  obtenerReporteInventario,
  obtenerReporteClientes
};