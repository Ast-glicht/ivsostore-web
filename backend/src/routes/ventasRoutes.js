const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.get('/pedidos', ventasController.listarPedidos);
router.get('/pedidos/:idPedido/productos', ventasController.obtenerProductosPedido);
router.put('/pedidos/:idPedido/estado', ventasController.actualizarEstadoPedido);
router.put('/pedidos/:idPedido/configuracion', ventasController.actualizarConfiguracionVenta);
router.get('/factura/:idPedido', ventasController.obtenerFactura);

module.exports = router;