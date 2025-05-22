const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: String,
    enum: ['director', 'profesor', 'admin', 'estudiante'],
    default: 'estudiante'
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para generar token JWT
usuarioSchema.methods.generarToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, rol: this.rol },
    process.env.JWT_SECRET || 'tu_jwt_secret',
    { expiresIn: '24h' }
  );
};

// Middleware para encriptar contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Usuario", usuarioSchema);
