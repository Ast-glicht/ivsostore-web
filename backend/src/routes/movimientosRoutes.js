const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');

router.get('/', movimientosController.listar);
router.post('/', movimientosController.registrar);

module.exports = router;