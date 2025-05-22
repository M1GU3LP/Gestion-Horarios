const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./presentation/routes/auth');
const docentesRoutes = require('./presentation/routes/docentes');
const materiasRoutes = require('./presentation/routes/materias');
const horariosRoutes = require('./presentation/routes/horarios');
const initDataRoutes = require('./presentation/routes/init-data');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/init', initDataRoutes);

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/gestion-horarios', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
}); 