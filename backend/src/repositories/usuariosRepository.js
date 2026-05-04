const { getConnection, sql } = require('../config/db');

async function registrarUsuario({ usuario, correo, contrasena, rol }) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('Usuario', sql.VarChar, usuario)
    .input('Correo', sql.VarChar, correo)
    .input('Contraseña', sql.VarChar, contrasena)
    .input('Rol', sql.VarChar, rol)
    .execute('sp_registrar_usuario');

  return result.recordset[0];
}

module.exports = {
  registrarUsuario
};