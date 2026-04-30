const clientesService = require('../services/clientesService');

async function listar(req, res) {
  try {
    const clientes = await clientesService.obtenerClientes();

    res.json({
      ok: true,
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los clientes.',
      error: error.message
    });
  }
}

async function registrar(req, res) {
  try {
    const resultado = await clientesService.registrarCliente(req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar el cliente.',
      error: error.message
    });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const resultado = await clientesService.actualizarCliente(id, req.body);

    if (!resultado.ok) {
      return res.status(400).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar el cliente.',
      error: error.message
    });
  }
}

module.exports = {
  listar,
  registrar,
  actualizar
};