const mongoose = require('mongoose');

const materiaSchema = new mongoose.Schema({
  nombre: String,
  horas_semanales: Number
});

module.exports = mongoose.model('Materia', materiaSchema);
