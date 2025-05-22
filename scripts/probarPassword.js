const mongoose = require('mongoose');
const Usuario = require('../src/data/models/Usuario');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    console.log('Conectado a MongoDB');
    try {
      await Usuario.deleteOne({ email: 'test@test.com' });
      console.log('Usuario anterior eliminado');

      const nuevoUsuario = new Usuario({
        nombre: 'Usuario Test',
        email: 'test@test.com',
        password: 'test123',
        rol: 'estudiante'
      });
      await nuevoUsuario.save();
      console.log('Nuevo usuario creado.');

      const usuario = await Usuario.findOne({ email: 'test@test.com' });
      if (!usuario) {
        console.log('Usuario no encontrado después de crear');
        process.exit(1);
      }
      console.log('Hash guardado:', usuario.password);

      const isMatch = await bcrypt.compare('test123', usuario.password);
      console.log('\n¿La contraseña test123 coincide con el hash guardado?:', isMatch);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      await mongoose.disconnect();
      process.exit();
    }
  })
  .catch(err => {
    console.error('Error de conexión:', err);
    process.exit(1);
  }); 