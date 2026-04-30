const ventasService = require('../services/ventasService');

async function listarPedidos(req, res) {
  try {
    const pedidos = await ventasService.obtenerPedidosVenta();

    res.json({
      ok: true,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error cargando pedidos.',
      error: error.message
    });
  }
}

async function listarProductosPedido(req, res) {
  try {
    const resultado = await ventasService.obtenerProductosPedido(req.params.id);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error cargando productos del pedido.',
      error: error.message
    });
  }
}

async function generarFactura(req, res) {
  try {
    const { formaPago } = req.body;

    const resultado = await ventasService.generarFacturaPedido(req.params.id, formaPago);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resultado.fileName}"`);
    res.send(resultado.pdfBuffer);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al generar la factura.',
      error: error.message
    });
  }
}
async function actualizarEstadoPedido(req, res) {
  try {
    const { estado } = req.body;

    const resultado = await ventasService.actualizarEstadoPedido(req.params.id, estado);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar el estado del pedido.',
      error: error.message
    });
  }
}
module.exports = {
  listarPedidos,
  listarProductosPedido,
  generarFactura,
  actualizarEstadoPedido
};