const { getConnection, sql } = require('../config/db');

async function validarLogin(usuario, contrasena) {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input('Usuario', sql.VarChar, usuario)
      .input('Contraseña', sql.VarChar, contrasena)
      .execute('Validar_Acceso');

    const row = result.recordset[0];

    console.log('Respuesta del SP Validar_Acceso:', row);

    if (!row) {
      return {
        valido: false,
        mensaje: 'Usuario o contraseña incorrectos o usuario deshabilitado.',
        usuario: '',
        rol: ''
      };
    }

    const valores = Object.values(row);

    const mensaje = valores[0] || '';
    const usuarioDB = valores[1] || '';
    const rol = valores[2] || '';

    const esValido = usuarioDB !== '' && rol !== '';

    if (esValido) {
      return {
        valido: true,
        mensaje: mensaje || 'Acceso permitido.',
        usuario: usuarioDB,
        rol: rol
      };
    }

    return {
      valido: false,
      mensaje: mensaje || 'Usuario o contraseña incorrectos.',
      usuario: '',
      rol: ''
    };
  } catch (error) {
    return {
      valido: false,
      mensaje: 'Error al conectar con la base de datos: ' + error.message,
      usuario: '',
      rol: ''
    };
  }
}

module.exports = {
  validarLogin
};