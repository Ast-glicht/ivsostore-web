const { getConnection, sql } = require('../config/db');

async function buscarUsuarioPorUsuarioOCorreo(usuarioOCorreo) {
  const pool = await getConnection();

  const result = await pool.request()
    .input('usuarioOCorreo', sql.VarChar, usuarioOCorreo)
    .query(`
      SELECT TOP 1
        Usuario AS usuario,
        Correo AS correo,
        rol AS rol,
        estado AS estado
      FROM Usuario
      WHERE Usuario = @usuarioOCorreo
         OR Correo = @usuarioOCorreo
    `);

  return result.recordset[0] || null;
}

async function obtenerCorreoGerente() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT TOP 1
      Usuario AS usuario,
      Correo AS correo
    FROM Usuario
    WHERE rol = 'Gerente'
      AND estado = 'Habilitado'
      AND Correo IS NOT NULL
      AND Correo <> ''
    ORDER BY Usuario
  `);

  return result.recordset[0] || null;
}

async function registrarSolicitudRecuperacion({
  usuarioSolicitante,
  correoSolicitante,
  codigoRecuperacion,
  correoGerente
}) {
  const pool = await getConnection();

  await pool.request()
    .input('usuarioSolicitante', sql.VarChar, usuarioSolicitante)
    .input('correoSolicitante', sql.VarChar, correoSolicitante || null)
    .input('codigoRecuperacion', sql.VarChar, codigoRecuperacion)
    .input('correoGerente', sql.VarChar, correoGerente)
    .query(`
      INSERT INTO recuperacion_contrasena
      (
        UsuarioSolicitante,
        CorreoSolicitante,
        CodigoRecuperacion,
        CorreoGerente,
        Estado
      )
      VALUES
      (
        @usuarioSolicitante,
        @correoSolicitante,
        @codigoRecuperacion,
        @correoGerente,
        'Pendiente'
      )
    `);
}

module.exports = {
  buscarUsuarioPorUsuarioOCorreo,
  obtenerCorreoGerente,
  registrarSolicitudRecuperacion
};