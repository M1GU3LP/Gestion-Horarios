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

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    usuario = new Usuario({
      nombre,
      email,
      password,
      rol: rol || 'profesor' // Por defecto, rol de profesor
    });

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);

    // Guardar usuario
    await usuario.save();

    // Generar token
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || 'tu_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario
router.post("/login", async (req, res) => {
  try {
    console.log('Headers recibidos:', req.headers);
    console.log('Body completo recibido:', { ...req.body, password: '***' });
    
    const { email, password } = req.body;
    console.log('Email recibido:', email);
    console.log('Password recibido:', password ? '***' : 'undefined');

    if (!email || !password) {
      console.log('Campos faltantes:', {
        email: !email ? 'falta email' : 'ok',
        password: !password ? 'falta password' : 'ok'
      });
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos',
        details: {
          email: !email ? 'El email es requerido' : null,
          password: !password ? 'La contraseña es requerida' : null
        }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido' });
    }

    const usuario = await Usuario.findOne({ email });
    console.log('Usuario encontrado:', usuario ? {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      passwordHash: usuario.password
    } : 'No');
    
    if (!usuario) {
      return res.status(400).json({ error: 'No existe un usuario con ese email' });
    }

    console.log('Comparando contraseñas...');
    console.log('Password recibido:', password ? '***' : 'undefined');
    console.log('Hash almacenado:', usuario.password);
    
    try {
      const isMatch = await usuario.compararPassword(password);
      console.log('¿Las contraseñas coinciden?:', isMatch);
      console.log('Detalles de la comparación:', {
        passwordRecibido: password ? '***' : 'undefined',
        hashAlmacenado: usuario.password,
        resultado: isMatch
      });

      if (!isMatch) {
        return res.status(400).json({ error: 'La contraseña es incorrecta' });
      }
    } catch (error) {
      console.error('Error al comparar contraseñas:', error);
      return res.status(500).json({ error: 'Error al verificar la contraseña' });
    }

    const token = usuario.generarToken();

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      details: error.message 
    });
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

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret');
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
