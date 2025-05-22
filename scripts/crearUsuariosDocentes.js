require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../src/data/models/Usuario');
const Docente = require('../src/data/models/Docente');

const docentes = [
  {
    nombre: "Juan Pérez",
    materias: ["Matemáticas", "Estadística"],
    cargaHorariaMaxima: 10
  },
  {
    nombre: "María García",
    materias: ["Química", "Biologia"],
    cargaHorariaMaxima: 10
  },
  {
    nombre: "Carlos López",
    materias: ["Física", "Robótica"],
    cargaHorariaMaxima: 10
  },
  {
    nombre: "Ana Martínez",
    materias: ["Lenguaje", "Literatura"],
    cargaHorariaMaxima: 10
  },
  {
    nombre: "Pedro Rodríguez",
    materias: ["Inglés", "Teatro"],
    cargaHorariaMaxima: 10
  },
  {
    nombre: "Laura Sánchez",
    materias: ["Ética", "Religion", "Filosofía"],
    cargaHorariaMaxima: 8
  },
  {
    nombre: "Miguel Torres",
    materias: ["Informática", "Programación"],
    cargaHorariaMaxima: 10
  },
  {
    nombre: "Carmen Ruiz",
    materias: ["Sociales", "Historia", "Geografía"],
    cargaHorariaMaxima: 10
  },
  {
    nombre: "Roberto Díaz",
    materias: ["Economía", "Emprendimiento"],
    cargaHorariaMaxima: 8
  },
  {
    nombre: "Sofía Vargas",
    materias: ["Artes", "Música", "Danza"],
    cargaHorariaMaxima: 8
  },
  {
    nombre: "Luis Mendoza",
    materias: ["Deportes", "Medio Ambiente"],
    cargaHorariaMaxima: 8
  },
  {
    nombre: "Patricia Gómez",
    materias: ["Derechos Humanos", "Sociología"],
    cargaHorariaMaxima: 8
  },
  {
    nombre: "Ricardo Soto",
    materias: ["Diseño Gráfico", "Tecnología"],
    cargaHorariaMaxima: 8
  }
];

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_horarios';

// Función para quitar tildes y caracteres especiales
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '.');
}

const crearUsuariosDocentes = async () => {
  try {
    console.log('Intentando conectar a MongoDB...');
    console.log('URI de conexión:', MONGODB_URI);
    
    // Conectar a la base de datos con opciones adicionales
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('Conectado a MongoDB exitosamente');

    // Verificar la conexión
    const dbState = mongoose.connection.readyState;
    console.log('Estado de la conexión:', dbState);
    if (dbState !== 1) {
      throw new Error('No se pudo establecer la conexión con la base de datos');
    }

    // Primero, crear los docentes
    console.log('Eliminando docentes existentes...');
    await Docente.deleteMany({});
    console.log('Docentes existentes eliminados');

    console.log('Creando nuevos docentes...');
    for (const docente of docentes) {
      const nuevoDocente = new Docente({
        ...docente,
        disponibilidad: generarDisponibilidadCompleta()
      });
      await nuevoDocente.save();
      console.log(`Docente creado: ${docente.nombre}`);
    }

    // Verificar que los docentes se hayan creado
    const docentesCreados = await Docente.find();
    console.log(`Total de docentes creados: ${docentesCreados.length}`);

    // Luego, crear los usuarios para cada docente
    console.log('Creando usuarios para los docentes...');
    for (const docente of docentes) {
      // Generar email basado en el nombre del docente (sin tildes)
      const email = `${normalizarTexto(docente.nombre)}@escuela.edu`;
      const password = '123456'; // Contraseña más simple

      // Verificar si ya existe un usuario con ese email
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        console.log(`Usuario ya existe para ${docente.nombre}`);
        continue;
      }

      // Crear nuevo usuario
      const nuevoUsuario = new Usuario({
        nombre: docente.nombre,
        email,
        password,
        rol: 'profesor'
      });

      await nuevoUsuario.save();
      console.log(`Usuario creado para ${docente.nombre}:`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('------------------------');
    }

    // Verificar que los usuarios se hayan creado
    const usuariosCreados = await Usuario.find({ rol: 'profesor' });
    console.log(`Total de usuarios creados: ${usuariosCreados.length}`);

    console.log('Proceso completado exitosamente');
  } catch (error) {
    console.error('Error detallado:', error);
    if (error.name === 'MongoServerSelectionError') {
      console.error('No se pudo conectar a MongoDB. Verifica que el servidor esté corriendo.');
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Desconectado de MongoDB');
    } catch (error) {
      console.error('Error al desconectar:', error);
    }
  }
};

// Función auxiliar para generar disponibilidad completa
function generarDisponibilidadCompleta() {
  const disponibilidad = [];
  for (let dia = 0; dia < 5; dia++) {
    for (let bloque = 0; bloque < 8; bloque++) {
      disponibilidad.push({
        dia,
        bloque,
        disponible: true
      });
    }
  }
  return disponibilidad;
}

// Ejecutar el script
crearUsuariosDocentes(); 