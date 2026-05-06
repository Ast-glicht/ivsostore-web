const movimientosRepository = require('../repositories/movimientosRepository');

async function obtenerMovimientos() {
  return await movimientosRepository.listarMovimientos();
}

module.exports = {
  obtenerMovimientos
};