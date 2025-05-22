require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./../src/data/models/Usuario');

const docentes = [
  {
    nombre: "Juan Pérez",
    email: "juan.perez@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "María García",
    email: "maria.garcia@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Carlos López",
    email: "carlos.lopez@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Ana Martínez",
    email: "ana.martinez@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Pedro Rodríguez",
    email: "pedro.rodriguez@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Laura Sánchez",
    email: "laura.sanchez@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Miguel Torres",
    email: "miguel.torres@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Carmen Ruiz",
    email: "carmen.ruiz@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Roberto Díaz",
    email: "roberto.diaz@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Sofía Vargas",
    email: "sofia.vargas@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Luis Mendoza",
    email: "luis.mendoza@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Patricia Gómez",
    email: "patricia.gomez@escuela.edu",
    password: "123456",
    rol: "profesor"
  },
  {
    nombre: "Ricardo Soto",
    email: "ricardo.soto@escuela.edu",
    password: "123456",
    rol: "profesor"
  }
];

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    console.log('Conectado a MongoDB');
    
    // Eliminar usuarios existentes con rol profesor
    console.log('Eliminando usuarios docentes existentes...');
    await Usuario.deleteMany({ rol: 'profesor' });
    console.log('Usuarios docentes eliminados');

    // Crear nuevos usuarios
    console.log('Creando nuevos usuarios docentes...');
    
    for (const docente of docentes) {
      console.log(`\nProcesando docente: ${docente.nombre}`);
      
      // Verificar si el usuario ya existe
      const exists = await Usuario.findOne({ email: docente.email });
      if (exists) {
        console.log(`Ya existe un usuario con el email: ${docente.email}`);
        continue;
      }

      // Crear nuevo usuario
      console.log('Creando nuevo usuario...');
      const user = new Usuario({
        email: docente.email,
        password: docente.password, // La contraseña se encriptará automáticamente por el middleware
        rol: docente.rol,
        nombre: docente.nombre
      });

      // Guardar usuario
      console.log('Guardando usuario...');
      await user.save();
      console.log('Usuario guardado exitosamente:');
      console.log(`- Nombre: ${user.nombre}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Rol: ${user.rol}`);
      console.log('------------------------');
    }

    // Verificar usuarios creados
    const usuariosCreados = await Usuario.find({ rol: 'profesor' });
    console.log(`\nTotal de usuarios docentes creados: ${usuariosCreados.length}`);
    
    console.log('\nLista de usuarios creados:');
    usuariosCreados.forEach(usuario => {
      console.log(`- ${usuario.nombre} (${usuario.email})`);
    });

    console.log('\nProceso completado exitosamente');
    process.exit();
  })
  .catch(err => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  }); 