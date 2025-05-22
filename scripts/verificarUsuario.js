const mongoose = require('mongoose');
const Usuario = require('../src/data/models/Usuario');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    const email = "estudiante@demo.com";
    
    console.log('Buscando usuario...');
    const usuario = await Usuario.findOne({ email });
    
    if (usuario) {
      console.log('Usuario encontrado:', {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        passwordHash: usuario.password
      });

      // Verificar contraseña
      const password = "estudiante123";
      const isMatch = await bcrypt.compare(password, usuario.password);
      console.log('¿La contraseña coincide?:', isMatch);

      if (!isMatch) {
        console.log('La contraseña no coincide. Intentando actualizar...');
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(password, salt);
        usuario.password = newHash;
        await usuario.save();
        console.log('Contraseña actualizada correctamente');
      }
    } else {
      console.log('No se encontró el usuario. Creando nuevo usuario...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("estudiante123", salt);
      
      const nuevoUsuario = new Usuario({
        nombre: "Estudiante Demo",
        email: "estudiante@demo.com",
        password: hashedPassword,
        rol: "estudiante"
      });
      
      await nuevoUsuario.save();
      console.log('Usuario creado exitosamente');
    }
    
    process.exit();
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  }); 