const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/', usuariosController.listar);
router.post('/', usuariosController.crear);
router.put('/', usuariosController.actualizar);
router.patch('/estado', usuariosController.cambiarEstado);

module.exports = router;