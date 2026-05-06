const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'pages/login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(publicPath, 'pages/dashboard.html'));
});
const authRoutes = require('./routes/authRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const movimientosRoutes = require('./routes/movimientosRoutes');
const recuperacionRoutes = require('./routes/recuperacionRoutes');
app.use('/api/recuperacion', recuperacionRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/movimientos', movimientosRoutes);
module.exports = app;