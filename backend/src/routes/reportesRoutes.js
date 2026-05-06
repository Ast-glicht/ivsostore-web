const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/ventas', reportesController.reporteVentas);
router.get('/ventas/excel', reportesController.exportarVentas);

router.get('/inventario', reportesController.reporteInventario);
router.get('/inventario/excel', reportesController.exportarInventario);

router.get('/clientes', reportesController.reporteClientes);
router.get('/clientes/excel', reportesController.exportarClientes);

module.exports = router;