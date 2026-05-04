const usuariosService = require('../services/usuariosService');

async function registrar(req, res) {
  try {
    const resultado = await usuariosService.registrarUsuario(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar usuario.',
      error: error.message
    });
  }
}

module.exports = {
  registrar
};