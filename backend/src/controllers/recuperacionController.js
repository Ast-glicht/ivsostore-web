const recuperacionService = require('../services/recuperacionService');

async function solicitar(req, res) {
  try {
    const resultado = await recuperacionService.solicitarRecuperacion(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al generar la solicitud de recuperación.',
      error: error.message
    });
  }
}

module.exports = {
  solicitar
};