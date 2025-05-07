const mongoose = require('mongoose');
const Horario = require('./../src/data/models/Horario'); // Ajusta el path si es necesario
const Docente = require('./../src/data/models/Docente'); // Importar el modelo Docente

mongoose.connect('mongodb://localhost:27017/horarios')
  .then(async () => {
    try {
      // Consultar un docente de la base de datos
      const docente = await Docente.findOne();
      if (!docente) {
        console.error("No se encontró ningún docente en la base de datos");
        process.exit(1);
      }

      const horarioEjemplo = {
        materia: "Matemáticas",
        docente: docente.nombre, // Usar el nombre del docente obtenido
        dia: 1, // Lunes
        bloque: 2 // Tercer bloque
      };

      const nuevoHorario = new Horario(horarioEjemplo);
      await nuevoHorario.save();

      console.log("Horario de ejemplo creado exitosamente");
      process.exit();
    } catch (error) {
      console.error("Error al crear el horario:", error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  });