const mongoose = require('mongoose');
const User = require('./../src/data/models/Usuario');

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    const email = "director@test.com";
    
    console.log('Buscando usuario...');
    const usuario = await User.findOne({ email });
    
    if (usuario) {
      console.log('Eliminando usuario existente...');
      await User.deleteOne({ email });
      console.log('Usuario eliminado exitosamente');
    } else {
      console.log('No se encontró el usuario');
    }
    
    process.exit();
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  }); 