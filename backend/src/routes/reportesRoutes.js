const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/ventas', reportesController.obtenerReporteVentas);
router.get('/ventas/excel', reportesController.exportarReporteVentasExcel);

module.exports = router;