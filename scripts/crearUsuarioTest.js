const mongoose = require('mongoose');
const Usuario = require('../src/data/models/Usuario');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    // Primero eliminar el usuario si existe
    await Usuario.deleteOne({ email: 'test@test.com' });
    
    // Crear nuevo usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);
    
    const nuevoUsuario = new Usuario({
      nombre: 'Usuario Test',
      email: 'test@test.com',
      password: hashedPassword,
      rol: 'estudiante'
    });
    
    await nuevoUsuario.save();
    console.log('Usuario de prueba creado exitosamente');
    console.log('Credenciales:');
    console.log('Email: test@test.com');
    console.log('Password: test123');
    
    process.exit();
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  }); 