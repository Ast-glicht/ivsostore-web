const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.listar);
router.post('/', clientesController.registrar);
router.put('/:id', clientesController.actualizar);

module.exports = router;