require('dotenv').config();
const mongoose = require('mongoose');
const Docente = require('../src/data/models/Docente');

const docentesEjemplo = [
  {
    nombre: "Juan Pérez",
    materias: ["Matemáticas", "Física"],
    cargaHorariaMaxima: 20
  },
  {
    nombre: "María García",
    materias: ["Lenguaje", "Literatura"],
    cargaHorariaMaxima: 18
  },
  {
    nombre: "Carlos Rodríguez",
    materias: ["Historia", "Sociales"],
    cargaHorariaMaxima: 16
  },
  {
    nombre: "Ana Martínez",
    materias: ["Biología", "Química"],
    cargaHorariaMaxima: 20
  },
  {
    nombre: "Luis Sánchez",
    materias: ["Inglés", "Informática"],
    cargaHorariaMaxima: 18
  }
];

const crearDocentesEjemplo = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_horarios');
    console.log('Conectado a MongoDB');

    // Eliminar docentes existentes
    await Docente.deleteMany({});
    console.log('Docentes existentes eliminados');

    // Crear nuevos docentes
    for (const docente of docentesEjemplo) {
      const nuevoDocente = new Docente(docente);
      await nuevoDocente.save();
      console.log(`Docente creado: ${docente.nombre}`);
    }

    console.log('Proceso completado');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

crearDocentesEjemplo(); 