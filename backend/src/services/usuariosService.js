const usuariosRepository = require('../repositories/usuariosRepository');

function validarCorreoGoogle(correo) {
  return /^[^\s@]+@gmail\.com$/i.test(correo);
}

async function registrarUsuario(data) {
  const { usuario, correo, contrasena, rol } = data;

  if (!usuario || !correo || !contrasena || !rol) {
    return {
      ok: false,
      mensaje: 'Todos los campos son obligatorios.'
    };
  }

  if (!validarCorreoGoogle(correo)) {
    return {
      ok: false,
      mensaje: 'Debe ingresar un correo de Google válido (@gmail.com).'
    };
  }

  if (contrasena.length < 6) {
    return {
      ok: false,
      mensaje: 'La contraseña debe tener al menos 6 caracteres.'
    };
  }

  const resultado = await usuariosRepository.registrarUsuario({
    usuario: usuario.trim(),
    correo: correo.trim(),
    contrasena: contrasena.trim(),
    rol: rol.trim()
  });

  return {
    ok: Boolean(resultado.ok),
    mensaje: resultado.mensaje
  };
}

module.exports = {
  registrarUsuario
};