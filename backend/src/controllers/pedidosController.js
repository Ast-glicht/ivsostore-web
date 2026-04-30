const pedidosService = require('../services/pedidosService');

async function listarClientes(req, res) {
  try {
    const data = await pedidosService.obtenerClientes();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar clientes.',
      error: error.message
    });
  }
}

async function listarVendedores(req, res) {
  try {
    const data = await pedidosService.obtenerVendedores();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar vendedores.',
      error: error.message
    });
  }
}

async function listarInventario(req, res) {
  try {
    const data = await pedidosService.obtenerInventarioDisponible();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar inventario.',
      error: error.message
    });
  }
}

async function crearPedido(req, res) {
  try {
    const resultado = await pedidosService.crearPedido(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al guardar el pedido.',
      error: error.message
    });
  }
}

async function listarPedidos(req, res) {
  try {
    const data = await pedidosService.listarPedidos();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al listar pedidos.',
      error: error.message
    });
  }
}

async function obtenerPedido(req, res) {
  try {
    const resultado = await pedidosService.obtenerPedidoPorId(req.params.id);

    if (!resultado.ok) {
      return res.status(404).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener el pedido.',
      error: error.message
    });
  }
}

async function actualizarPedido(req, res) {
  try {
    const resultado = await pedidosService.actualizarPedido(req.params.id, req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar el pedido.',
      error: error.message
    });
  }
}

module.exports = {
  listarClientes,
  listarVendedores,
  listarInventario,
  crearPedido,
  listarPedidos,
  obtenerPedido,
  actualizarPedido
};