const mongoose = require('mongoose');
const Usuario = require('../src/data/models/Usuario');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    try {
      // Buscar el usuario de prueba
      const usuario = await Usuario.findOne({ email: 'test@test.com' });
      
      if (usuario) {
        console.log('Usuario encontrado:', {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          passwordHash: usuario.password
        });
        
        // Actualizar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('test123', salt);
        usuario.password = hashedPassword;
        await usuario.save();
        
        console.log('Contraseña actualizada exitosamente');
      } else {
        console.log('Usuario no encontrado, creando nuevo usuario...');
        
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
      }
      
      console.log('\nCredenciales:');
      console.log('Email: test@test.com');
      console.log('Password: test123');
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await mongoose.disconnect();
      process.exit();
    }
  })
  .catch(err => {
    console.error("Error de conexión:", err);
    process.exit(1);
  }); 