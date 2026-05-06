const movimientosRepository = require('../repositories/movimientosRepository');

async function obtenerMovimientos() {
  return await movimientosRepository.listarMovimientos();
}

async function registrarMovimiento(data) {
  const { idproducto, tipoMovimiento, cantidad, motivo, usuario } = data;

  if (!idproducto || !tipoMovimiento || cantidad === undefined || cantidad === null) {
    return {
      ok: false,
      mensaje: 'Producto, tipo de movimiento y cantidad son obligatorios.'
    };
  }

  if (!['Entrada', 'Salida'].includes(tipoMovimiento)) {
    return {
      ok: false,
      mensaje: 'El tipo de movimiento debe ser Entrada o Salida.'
    };
  }

  const cantidadNumero = Number(cantidad);

  if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
    return {
      ok: false,
      mensaje: 'La cantidad debe ser un número entero mayor a 0.'
    };
  }

  await movimientosRepository.registrarMovimiento({
    idproducto: Number(idproducto),
    tipoMovimiento,
    cantidad: cantidadNumero,
    motivo: motivo?.trim() || '',
    usuario: usuario?.trim() || 'Sistema'
  });

  return {
    ok: true,
    mensaje: 'Movimiento registrado correctamente sin alterar el stock actual.'
  };
}

module.exports = {
  obtenerMovimientos,
  registrarMovimiento
};