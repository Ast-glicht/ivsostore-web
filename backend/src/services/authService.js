const authRepository = require('../repositories/authRepository');

async function iniciarSesion(usuario, contrasena) {
  if (!usuario || !contrasena || usuario.trim() === '' || contrasena.trim() === '') {
    return {
      valido: false,
      mensaje: 'Por favor completá todos los campos.',
      campo: '',
      usuario: '',
      rol: ''
    };
  }

  const resultado = await authRepository.validarLogin(usuario.trim(), contrasena.trim());

  return {
    ...resultado,
    campo: ''
  };
}

module.exports = {
  iniciarSesion
};