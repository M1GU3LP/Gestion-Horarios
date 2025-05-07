const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  materia: { type: String, required: true },
  docente: { type: String, required: true },
  dia: { type: Number, required: true }, 
  bloque: { type: Number, required: true } 
});

module.exports = mongoose.model('Horario', horarioSchema);
