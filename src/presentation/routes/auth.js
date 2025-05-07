const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../../data/models/Usuario");

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || "mi_secreto"; // Usar una variable de entorno en producción

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = new Usuario({ nombre, email, password: hashedPassword, rol });
    await usuario.save();
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Datos recibidos:", { email, password }); // Depuración: Verificar datos recibidos

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      console.log("Usuario no encontrado"); // Depuración: Usuario no existe
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      console.log("Contraseña incorrecta"); // Depuración: Contraseña no coincide
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, SECRET_KEY, {
      expiresIn: "1h",
    });

    console.log("Inicio de sesión exitoso"); // Depuración: Inicio de sesión correcto
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error); // Depuración: Error inesperado
    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
});

// Ruta para crear un nuevo usuario con rol docente
router.post("/create-docente", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const docente = new Usuario({ nombre, email, password: hashedPassword, rol: "docente" });
    await docente.save();
    res.status(201).json({ message: "Docente creado correctamente", docente });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ruta para obtener información del usuario autenticado
router.get("/me", async (req, res) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
    const usuario = await Usuario.findById(decoded.id).select("-password"); // Excluir contraseña
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuario);
  } catch (err) {
    console.error("Error al verificar el token:", err.message);
    res.status(400).json({ error: "Token inválido" });
  }
});

module.exports = router;
