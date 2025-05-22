require("dotenv").config();
const jwt = require("jsonwebtoken");
const Usuario = require('../../data/models/Usuario');

// Middleware de autenticación
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No se proporcionó token de autenticación');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret');
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    req.usuario = usuario;
    req.token = token;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Por favor autentícate correctamente' });
  }
};

// Middleware para verificar roles
const verificarRol = (roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }

    next();
  };
};

module.exports = { auth, verificarRol };
