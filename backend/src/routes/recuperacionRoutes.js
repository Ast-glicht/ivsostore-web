const express = require('express');
const router = express.Router();
const recuperacionController = require('../controllers/recuperacionController');

router.post('/solicitar', recuperacionController.solicitar);

module.exports = router;