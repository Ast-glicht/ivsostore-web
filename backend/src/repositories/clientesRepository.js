const { getConnection, sql } = require('../config/db');

async function listarClientes() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      IDcliente AS idcliente,
      Nombre AS nombre,
      Empresa AS empresa,
      Telefono AS telefono,
      Departamento AS departamento,
      Municipio AS municipio,
      Barrio AS barrio,
      DetalleDireccion AS detalleDireccion,
      Cobertura AS cobertura
    FROM dbo.clientes
    ORDER BY IDcliente DESC;
  `);

  return result.recordset;
}

async function registrarCliente({
  nombre,
  telefono,
  empresa,
  departamento,
  municipio,
  barrio,
  detalleDireccion,
  cobertura
}) {
  const pool = await getConnection();

  await pool.request()
    .input('nombre', sql.VarChar, nombre)
    .input('telefono', sql.VarChar, telefono)
    .input('empresa', sql.VarChar, empresa)
    .input('departamento', sql.VarChar, departamento)
    .input('municipio', sql.VarChar, municipio)
    .input('barrio', sql.VarChar, barrio)
    .input('detalleDireccion', sql.VarChar, detalleDireccion)
    .input('cobertura', sql.VarChar, cobertura)
    .execute('sp_registrar_cliente');
}

async function actualizarCliente(id, {
  nombre,
  telefono,
  empresa,
  departamento,
  municipio,
  barrio,
  detalleDireccion,
  cobertura
}) {
  const pool = await getConnection();

  await pool.request()
    .input('idcliente', sql.Int, id)
    .input('nombre', sql.VarChar, nombre)
    .input('telefono', sql.VarChar, telefono)
    .input('empresa', sql.VarChar, empresa)
    .input('departamento', sql.VarChar, departamento)
    .input('municipio', sql.VarChar, municipio)
    .input('barrio', sql.VarChar, barrio)
    .input('detalleDireccion', sql.VarChar, detalleDireccion)
    .input('cobertura', sql.VarChar, cobertura)
    .execute('sp_actualizar_cliente');
}

module.exports = {
  listarClientes,
  registrarCliente,
  actualizarCliente
};