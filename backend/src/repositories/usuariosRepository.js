const { getConnection, sql } = require('../config/db');

async function listarUsuarios() {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT
      Usuario AS usuario,
      Correo AS correo,
      rol AS rol,
      estado AS estado
    FROM Usuario
    ORDER BY Usuario
  `);

  return result.recordset;
}

async function existeUsuario(usuario, usuarioExcluir = null) {
  const pool = await getConnection();

  const request = pool.request()
    .input('usuario', sql.VarChar, usuario);

  let query = `
    SELECT COUNT(*) AS total
    FROM Usuario
    WHERE Usuario = @usuario
  `;

  if (usuarioExcluir) {
    request.input('usuarioExcluir', sql.VarChar, usuarioExcluir);
    query += ` AND Usuario <> @usuarioExcluir`;
  }

  const result = await request.query(query);
  return result.recordset[0].total > 0;
}

async function existeCorreo(correo, usuarioExcluir = null) {
  if (!correo) return false;

  const pool = await getConnection();

  const request = pool.request()
    .input('correo', sql.VarChar, correo);

  let query = `
    SELECT COUNT(*) AS total
    FROM Usuario
    WHERE Correo = @correo
  `;

  if (usuarioExcluir) {
    request.input('usuarioExcluir', sql.VarChar, usuarioExcluir);
    query += ` AND Usuario <> @usuarioExcluir`;
  }

  const result = await request.query(query);
  return result.recordset[0].total > 0;
}

async function crearUsuario({ usuario, correo, contrasena, rol, estado }) {
  const pool = await getConnection();

  await pool.request()
    .input('usuario', sql.VarChar, usuario)
    .input('correo', sql.VarChar, correo || null)
    .input('contrasena', sql.VarChar, contrasena)
    .input('rol', sql.VarChar, rol)
    .input('estado', sql.VarChar, estado || 'Habilitado')
    .query(`
      INSERT INTO Usuario
      (
        Usuario,
        Correo,
        [contraseña],
        rol,
        estado
      )
      VALUES
      (
        @usuario,
        @correo,
        ENCRYPTBYPASSPHRASE(@contrasena, @contrasena),
        @rol,
        @estado
      )
    `);
}

async function actualizarUsuario({
  usuarioOriginal,
  usuario,
  correo,
  contrasena,
  rol,
  estado
}) {
  const pool = await getConnection();

  if (contrasena && contrasena.trim() !== '') {
    await pool.request()
      .input('usuarioOriginal', sql.VarChar, usuarioOriginal)
      .input('usuario', sql.VarChar, usuario)
      .input('correo', sql.VarChar, correo || null)
      .input('contrasena', sql.VarChar, contrasena)
      .input('rol', sql.VarChar, rol)
      .input('estado', sql.VarChar, estado)
      .query(`
        UPDATE Usuario
        SET
          Usuario = @usuario,
          Correo = @correo,
          [contraseña] = ENCRYPTBYPASSPHRASE(@contrasena, @contrasena),
          rol = @rol,
          estado = @estado
        WHERE Usuario = @usuarioOriginal
      `);
  } else {
    await pool.request()
      .input('usuarioOriginal', sql.VarChar, usuarioOriginal)
      .input('usuario', sql.VarChar, usuario)
      .input('correo', sql.VarChar, correo || null)
      .input('rol', sql.VarChar, rol)
      .input('estado', sql.VarChar, estado)
      .query(`
        UPDATE Usuario
        SET
          Usuario = @usuario,
          Correo = @correo,
          rol = @rol,
          estado = @estado
        WHERE Usuario = @usuarioOriginal
      `);
  }
}

async function cambiarEstadoUsuario(usuario, estado) {
  const pool = await getConnection();

  await pool.request()
    .input('usuario', sql.VarChar, usuario)
    .input('estado', sql.VarChar, estado)
    .query(`
      UPDATE Usuario
      SET estado = @estado
      WHERE Usuario = @usuario
    `);
}

module.exports = {
  listarUsuarios,
  existeUsuario,
  existeCorreo,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario
};