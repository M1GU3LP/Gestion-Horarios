const mongoose = require('mongoose');

const docenteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  materias: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Un docente debe tener al menos una materia asignada'
    }
  },
  disponibilidad: [{
    dia: {
      type: Number,
      required: true,
      min: 0,
      max: 4
    },
    bloque: {
      type: Number,
      required: true,
      min: 0,
      max: 7
    },
    disponible: {
      type: Boolean,
      default: true
    }
  }],
  cargaHorariaMaxima: {
    type: Number,
    required: true,
    min: 1,
    max: 40,
    default: 16
  },
  cargaHorariaActual: {
    type: Number,
    default: 0,
    min: 0
  },
  horasPorDia: {
    type: [Number],
    default: function() {
      return Array(5).fill(0);
    },
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 5;
      },
      message: 'horasPorDia debe ser un array de 5 elementos'
    }
  }
});

// Middleware para inicializar la disponibilidad si está vacía
docenteSchema.pre('save', function(next) {
  if (!this.disponibilidad || this.disponibilidad.length === 0) {
    this.disponibilidad = [];
    // Generar disponibilidad para todos los días y bloques
    for (let dia = 0; dia < 5; dia++) {
      for (let bloque = 0; bloque < 8; bloque++) {
        this.disponibilidad.push({
          dia,
          bloque,
          disponible: true
        });
      }
    }
  }
  next();
});

// Método para verificar disponibilidad
docenteSchema.methods.estaDisponible = function(dia, bloque) {
  const slot = this.disponibilidad.find(d => d.dia === dia && d.bloque === bloque);
  return slot ? slot.disponible : false;
};

// Método para actualizar carga horaria
docenteSchema.methods.actualizarCargaHoraria = function(dia, incremento = 1) {
  this.cargaHorariaActual += incremento;
  this.horasPorDia[dia] += incremento;
  return this.save();
};

module.exports = mongoose.model('Docente', docenteSchema);
