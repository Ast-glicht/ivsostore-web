const movimientosService = require('../services/movimientosService');

async function listar(req, res) {
  try {
    const movimientos = await movimientosService.obtenerMovimientos();

    res.json({
      ok: true,
      data: movimientos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar el historial de movimientos.',
      error: error.message
    });
  }
}

module.exports = {
  listar
};