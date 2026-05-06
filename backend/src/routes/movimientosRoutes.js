const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');

router.get('/', movimientosController.listar);

module.exports = router;