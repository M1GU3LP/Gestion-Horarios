const mongoose = require('mongoose');

const docenteSchema = new mongoose.Schema({
  nombre: String,
  materias: [String],
  disponibilidad: [Number], // Cambiado a un arreglo de números para almacenar solo bloques
  dias: [String]
});

module.exports = mongoose.model('Docente', docenteSchema);
