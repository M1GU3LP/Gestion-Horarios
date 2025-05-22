const mongoose = require('mongoose');

const materiaSchema = new mongoose.Schema({
  nombre: String,
  horas_semanales: Number,
  cargaHoraria: Number, // Carga horaria semanal de la materia
});

module.exports = mongoose.model('Materia', materiaSchema);
