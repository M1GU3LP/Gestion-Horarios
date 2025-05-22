const express = require('express');
const mongoose = require('mongoose');
const docentesRoutes = require('../src/presentation/routes/docentes');
const materiasRoutes = require('../src/presentation/routes/Materias');
const horariosRoutes =require('../src/presentation/routes/horarios');
const authRoutes = require("./presentation/routes/auth"); 
const initDataRoutes = require("./presentation/routes/init-data");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Crear un flujo de escritura para los logs
const logStream = fs.createWriteStream(path.join(__dirname, "server.log"), { flags: "a" });

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  logStream.write(log);
  console.log(log);
  next();
});

app.use(express.json());
app.use(cors()); // Habilitar CORS para todas las solicitudes

mongoose.connect('mongodb://localhost:27017/horarios', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// Rutas de la API
app.use('/api/docentes', docentesRoutes);
app.use('/api/materias', materiasRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/init", initDataRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
