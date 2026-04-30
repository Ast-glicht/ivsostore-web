const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
module.exports = app;