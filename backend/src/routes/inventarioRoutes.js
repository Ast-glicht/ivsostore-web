const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.get('/', inventarioController.listar);
router.post('/', inventarioController.registrar);
router.put('/:id', inventarioController.actualizar);

module.exports = router;