require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "mi_secreto"; // Usar variable de entorno para mayor seguridad

// Middleware de autenticación
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (err) {
    console.error("Error al verificar el token:", err.message); // Agregar log para depuración
    res.status(400).json({ error: "Token inválido" });
  }
};

// Middleware para verificar roles
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "No tienes permiso para acceder" });
    }
    next();
  };
};

module.exports = { auth, verificarRol };
