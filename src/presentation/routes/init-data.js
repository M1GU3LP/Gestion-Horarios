const express = require('express');
const router = express.Router();
const Materia = require('../../data/models/Materia');
const Docente = require('../../data/models/Docente');
const { auth, verificarRol } = require('../../business/middleware/auth');

// Ruta para inicializar datos de prueba
router.post('/init', auth, verificarRol(['director']), async (req, res) => {
  try {
    // Limpiar datos existentes
    await Materia.deleteMany({});
    await Docente.deleteMany({});

    // Crear materias con carga horaria específica
    const materias = await Materia.insertMany([
      {
        nombre: "Matemáticas",
        horas_semanales: 8,
        cargaHoraria: 8
      },
      {
        nombre: "Lenguaje",
        horas_semanales: 6,
        cargaHoraria: 6
      },
      {
        nombre: "Inglés",
        horas_semanales: 4,
        cargaHoraria: 4
      },
      {
        nombre: "Sociales",
        horas_semanales: 4,
        cargaHoraria: 4
      },
      {
        nombre: "Ética",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Religion",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Informática",
        horas_semanales: 2,
        cargaHoraria: 2
      },
      {
        nombre: "Biologia",
        horas_semanales: 4,
        cargaHoraria: 4
      },
      {
        nombre: "Quimica",
        horas_semanales: 4,
        cargaHoraria: 4
      },
      {
        nombre: "Fisica",
        horas_semanales: 4,
        cargaHoraria: 4
      }
    ]);

    // Crear docentes con materias y disponibilidad
    const docentes = await Docente.insertMany([
      {
        nombre: "Juan Pérez",
        materias: ["Matemáticas", "Física"],
        cargaHorariaMaxima: 16,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "María García",
        materias: ["Química", "Biologia"],
        cargaHorariaMaxima: 16,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Carlos López",
        materias: ["Matemáticas", "Física"],
        cargaHorariaMaxima: 16,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Ana Martínez",
        materias: ["Lenguaje", "Sociales"],
        cargaHorariaMaxima: 16,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Pedro Rodríguez",
        materias: ["Inglés", "Lenguaje"],
        cargaHorariaMaxima: 16,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Laura Sánchez",
        materias: ["Ética", "Religion"],
        cargaHorariaMaxima: 12,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Miguel Torres",
        materias: ["Informática", "Matemáticas"],
        cargaHorariaMaxima: 16,
        disponibilidad: generarDisponibilidadCompleta()
      }
    ]);

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

    res.status(201).json({
      message: "Datos de prueba inicializados correctamente",
      materias,
      docentes
    });

  } catch (error) {
    console.error("Error al inicializar datos de prueba:", error);
    res.status(500).json({
      error: "Error al inicializar datos de prueba",
      details: error.message
    });
  }
});

module.exports = router; 