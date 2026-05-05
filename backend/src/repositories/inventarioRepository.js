const { getConnection, sql } = require('../config/db');

async function listarProductos() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      i.IDproducto AS idproducto,
      i.NombreProducto AS nombreProducto,
      i.Descripcion AS descripcion,
      i.Codigo AS codigo,
      i.Precio AS precio,
      i.Stock AS stock,
      i.FechaDeCompra AS fechaDeCompra,
      i.FechaVencimiento AS fechaVencimiento,
      p.NombreProveedor AS proveedor,
      p.NumeroProveedor AS numeroProveedor
    FROM inventario i
    LEFT JOIN proveedores p ON i.idProveedor = p.idProveedor
    ORDER BY i.IDproducto DESC
  `);

  return result.recordset;
}

async function existeCodigoProducto(codigo, idExcluir = null) {
  const pool = await getConnection();

  const request = pool.request()
    .input('codigo', sql.VarChar, codigo);

  let query = `
    SELECT COUNT(*) AS total
    FROM inventario
    WHERE Codigo = @codigo
  `;

  if (idExcluir !== null) {
    request.input('idExcluir', sql.Int, idExcluir);
    query += ` AND IDproducto <> @idExcluir`;
  }

  const result = await request.query(query);
  return result.recordset[0].total > 0;
}

async function registrarProducto({
  nombreProducto,
  descripcion,
  codigo,
  precio,
  stock,
  proveedor,
  numeroProveedor,
  fechaVencimiento
}) {
  const pool = await getConnection();

  await pool.request()
    .input('nombreproducto', sql.VarChar, nombreProducto)
    .input('descripcion', sql.VarChar, descripcion)
    .input('codigo', sql.VarChar, codigo)
    .input('precio', sql.Decimal(18, 2), precio)
    .input('stock', sql.Int, stock)
    .input('nombreProveedor', sql.VarChar, proveedor)
    .input('numeroProveedor', sql.VarChar, numeroProveedor)
    .input('fechaVencimiento', sql.Date, fechaVencimiento || null)
    .execute('sp_registrar_producto');
}

async function actualizarProducto(id, {
  nombreProducto,
  descripcion,
  codigo,
  precio,
  stock,
  proveedor,
  numeroProveedor,
  fechaDeCompra,
  fechaVencimiento
}) {
  const pool = await getConnection();

  await pool.request()
    .input('idproducto', sql.Int, id)
    .input('nombreproducto', sql.VarChar, nombreProducto)
    .input('descripcion', sql.VarChar, descripcion)
    .input('codigo', sql.VarChar, codigo)
    .input('precio', sql.Decimal(18, 2), precio)
    .input('stock', sql.Int, stock)
    .input('nombreProveedor', sql.VarChar, proveedor)
    .input('numeroProveedor', sql.VarChar, numeroProveedor)
    .execute('sp_actualizar_producto');

  await pool.request()
    .input('fecha', sql.DateTime, fechaDeCompra)
    .input('fechaVencimiento', sql.Date, fechaVencimiento || null)
    .input('id', sql.Int, id)
    .query(`
      UPDATE inventario
      SET 
        FechaDeCompra = @fecha,
        FechaVencimiento = @fechaVencimiento
      WHERE IDproducto = @id
    `);
}

module.exports = {
  listarProductos,
  registrarProducto,
  actualizarProducto,
  existeCodigoProducto
};