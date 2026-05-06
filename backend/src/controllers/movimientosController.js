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

async function registrar(req, res) {
  try {
    const resultado = await movimientosService.registrarMovimiento(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar el movimiento.',
      error: error.message
    });
  }
}

module.exports = {
  listar,
  registrar
};