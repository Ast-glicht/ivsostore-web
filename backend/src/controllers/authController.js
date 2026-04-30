const authService = require('../services/authService');

async function login(req, res) {
  try {
    const { usuario, contrasena } = req.body;

    const resultado = await authService.iniciarSesion(usuario, contrasena);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      valido: false,
      mensaje: 'Error interno del servidor.',
      campo: '',
      usuario: '',
      rol: ''
    });
  }
}

module.exports = {
  login
};