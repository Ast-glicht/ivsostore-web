const usuariosService = require('../services/usuariosService');

async function listar(req, res) {
  try {
    const usuarios = await usuariosService.obtenerUsuarios();

    res.json({
      ok: true,
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar usuarios.',
      error: error.message
    });
  }
}

async function crear(req, res) {
  try {
    const resultado = await usuariosService.crearUsuario(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al crear usuario.',
      error: error.message
    });
  }
}

async function actualizar(req, res) {
  try {
    const resultado = await usuariosService.actualizarUsuario(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar usuario.',
      error: error.message
    });
  }
}

async function cambiarEstado(req, res) {
  try {
    const resultado = await usuariosService.cambiarEstadoUsuario(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cambiar estado del usuario.',
      error: error.message
    });
  }
}

module.exports = {
  listar,
  crear,
  actualizar,
  cambiarEstado
};