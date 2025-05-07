const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./../src/data/models/Usuario'); // ajusta el path si es necesario

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    const email = "estudiante@escuela.com"; // Cambiar correo para evitar conflictos
    const plainPassword = "password123";
    const rol = "estudiante";

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("Ya existe un usuario con ese correo.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = new User({ email, password: hashedPassword, rol });
    await user.save();

    console.log("Usuario creado exitosamente");
    process.exit();
  })
  .catch(err => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  });
