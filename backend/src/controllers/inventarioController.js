const inventarioService = require('../services/inventarioService');

async function listar(req, res) {
  try {
    const productos = await inventarioService.obtenerProductos();

    res.json({
      ok: true,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al cargar los productos.',
      error: error.message
    });
  }
}

async function registrar(req, res) {
  try {
    const resultado = await inventarioService.registrarProducto(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al guardar el producto.',
      error: error.message
    });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const resultado = await inventarioService.actualizarProducto(id, req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar el producto.',
      error: error.message
    });
  }
}

module.exports = {
  listar,
  registrar,
  actualizar
};