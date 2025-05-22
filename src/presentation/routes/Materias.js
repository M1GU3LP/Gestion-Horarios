const express = require('express');
const router = express.Router();
const Materia = require('../../data/models/Materia');
const { auth, verificarRol } = require('../../business/middleware/auth');

// Obtener todas las materias
router.get('/', auth, async (req, res) => {
  try {
    console.log('Obteniendo lista de materias...');
    const materias = await Materia.find().select('nombre horas_semanales cargaHoraria').lean();
    console.log('Materias encontradas:', materias);
    
    if (!materias || materias.length === 0) {
      console.log('No se encontraron materias');
      return res.status(404).json({ 
        error: 'No hay materias registradas',
        materias: []
      });
    }

    res.json(materias);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({ 
      error: 'Error al obtener las materias',
      details: error.message
    });
  }
});

// Reinicializar materias con configuración correcta
router.post('/reset', auth, verificarRol(['director']), async (req, res) => {
  try {
    // Eliminar todas las materias existentes
    await Materia.deleteMany({});

    // Crear nuevas materias con configuración correcta
    const materias = await Materia.insertMany([
      {
        nombre: "Matemáticas",
        horas_semanales: 4,
        cargaHoraria: 4
      },
      {
        nombre: "Lenguaje",
        horas_semanales: 3,
        cargaHoraria: 3
      },
      {
        nombre: "Inglés",
        horas_semanales: 3,
        cargaHoraria: 3
      },
      {
        nombre: "Sociales",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Historia",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Geografía",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Ética",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Religion",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Filosofía",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Informática",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Biologia",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Química",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Física",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Deportes",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Música",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Emprendimiento",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Economía",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Estadística",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Programación",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Diseño Gráfico",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Sociología",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Medio Ambiente",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Derechos Humanos",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Robótica",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Teatro",
        horas_semanales: 1,
        cargaHoraria: 1
      },
      {
        nombre: "Danza",
        horas_semanales: 1,
        cargaHoraria: 1
      }
    ]);

    res.status(201).json({
      message: "Materias reinicializadas correctamente",
      materias
    });
  } catch (err) {
    console.error("Error al reinicializar materias:", err);
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva materia (solo director)
router.post('/', auth, verificarRol(['director']), async (req, res) => {
  try {
    const { nombre, horas_semanales, cargaHoraria } = req.body;

    // Validar campos requeridos
    if (!nombre || !horas_semanales || !cargaHoraria) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios',
        required: ['nombre', 'horas_semanales', 'cargaHoraria']
      });
    }

    // Verificar si la materia ya existe
    const materiaExistente = await Materia.findOne({ nombre });
    if (materiaExistente) {
      return res.status(400).json({
        error: 'Ya existe una materia con ese nombre'
      });
    }

    const nuevaMateria = new Materia({
      nombre,
      horas_semanales,
      cargaHoraria
    });

    await nuevaMateria.save();
    console.log('Nueva materia creada:', nuevaMateria);

    res.status(201).json(nuevaMateria);
  } catch (error) {
    console.error('Error al crear materia:', error);
    res.status(500).json({
      error: 'Error al crear la materia',
      details: error.message
    });
  }
});

// Actualizar materia
router.put('/:id', auth, verificarRol(['director']), async (req, res) => {
  try {
    const materiaActualizada = await Materia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(materiaActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar materia
router.delete('/:id', auth, verificarRol(['director']), async (req, res) => {
  try {
    await Materia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Materia eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
