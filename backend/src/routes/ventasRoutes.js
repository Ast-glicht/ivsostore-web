const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.get('/pedidos', ventasController.listarPedidos);
router.get('/pedidos/:id/productos', ventasController.listarProductosPedido);
router.post('/pedidos/:id/factura', ventasController.generarFactura);
router.put('/pedidos/:id/estado', ventasController.actualizarEstadoPedido);
module.exports = router;