const mongoose = require('mongoose');
const User = require('./../src/data/models/Usuario');

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    const email = "director@test.com";
    const plainPassword = "password123";
    const rol = "director";
    const nombre = "Director Principal";

    console.log('Buscando usuario existente...');
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("Ya existe un usuario con ese correo.");
      process.exit();
    }

    console.log('Creando nuevo usuario...');
    const user = new User({ 
      email, 
      password: plainPassword, // La contraseña se encriptará automáticamente por el middleware
      rol,
      nombre 
    });
    
    console.log('Guardando usuario...');
    await user.save();
    console.log('Usuario guardado:', user);

    console.log("Usuario director creado exitosamente");
    process.exit();
  })
  .catch(err => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  });
