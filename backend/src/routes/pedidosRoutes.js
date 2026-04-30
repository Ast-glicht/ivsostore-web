const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');

router.get('/clientes', pedidosController.listarClientes);
router.get('/vendedores', pedidosController.listarVendedores);
router.get('/inventario', pedidosController.listarInventario);

router.get('/', pedidosController.listarPedidos);
router.get('/:id', pedidosController.obtenerPedido);

router.post('/', pedidosController.crearPedido);
router.put('/:id', pedidosController.actualizarPedido);

module.exports = router;