const ventasRepository = require('../repositories/ventasRepository');
const facturaPdfService = require('./facturaPdfService');

async function obtenerPedidosVenta() {
  return await ventasRepository.listarPedidosVenta();
}

async function obtenerProductosPedido(idPedido) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'ID de pedido inválido.'
    };
  }

  const productos = await ventasRepository.obtenerProductosPedido(Number(idPedido));

  return {
    ok: true,
    data: productos
  };
}

async function generarFacturaPedido(idPedido, formaPago) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'ID de pedido inválido.'
    };
  }

  if (!formaPago || !String(formaPago).trim()) {
    return {
      ok: false,
      mensaje: 'Seleccione una forma de pago antes de generar la factura.'
    };
  }

  const rows = await ventasRepository.obtenerDatosFactura(Number(idPedido));
  const facturaData = facturaPdfService.construirFacturaData(rows, String(formaPago).trim());

  if (!facturaData) {
    return {
      ok: false,
      mensaje: 'No se pudo obtener la información del pedido.'
    };
  }

  const pdfBuffer = await facturaPdfService.generarFacturaPdfBuffer(facturaData);

  return {
    ok: true,
    pdfBuffer,
    fileName: `Factura_${idPedido}.pdf`
  };
}
async function actualizarEstadoPedido(idPedido, estado) {
  if (!idPedido || Number.isNaN(Number(idPedido))) {
    return {
      ok: false,
      mensaje: 'Seleccione un pedido válido.'
    };
  }

  if (!estado || !String(estado).trim()) {
    return {
      ok: false,
      mensaje: 'Seleccione un estado para el pedido.'
    };
  }

  await ventasRepository.actualizarEstadoPedido(Number(idPedido), String(estado).trim());

  return {
    ok: true,
    mensaje: 'Estado del pedido actualizado correctamente.'
  };
}
module.exports = {
  obtenerPedidosVenta,
  obtenerProductosPedido,
  generarFacturaPedido,
  actualizarEstadoPedido
};