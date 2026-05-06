const ventasService = require('../services/ventasService');

async function listarPedidos(req, res) {
  try {
    const pedidos = await ventasService.listarPedidos();

    res.json({
      ok: true,
      data: pedidos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar pedidos de venta.',
      error: error.message
    });
  }
}

async function obtenerProductosPedido(req, res) {
  try {
    const { idPedido } = req.params;
    const resultado = await ventasService.obtenerProductosPedido(idPedido);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar productos del pedido.',
      error: error.message
    });
  }
}

async function actualizarEstadoPedido(req, res) {
  try {
    const { idPedido } = req.params;
    const { estado } = req.body;

    const resultado = await ventasService.actualizarEstadoPedido(idPedido, estado);

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

async function actualizarConfiguracionVenta(req, res) {
  try {
    const { idPedido } = req.params;

    const resultado = await ventasService.actualizarConfiguracionVenta(idPedido, req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al aplicar descuento o moneda.',
      error: error.message
    });
  }
}

async function obtenerFactura(req, res) {
  try {
    const { idPedido } = req.params;
    const { formaPago } = req.query;

    const resultado = await ventasService.obtenerFactura(idPedido, formaPago);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener datos de factura.',
      error: error.message
    });
  }
}

module.exports = {
  listarPedidos,
  obtenerProductosPedido,
  actualizarEstadoPedido,
  actualizarConfiguracionVenta,
  obtenerFactura
};