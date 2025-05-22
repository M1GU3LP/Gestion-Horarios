const express = require('express');
const router = express.Router();
const Docente = require('../../data/models/Docente');
const { auth, verificarRol } = require('../../business/middleware/auth');

// Obtener todos los docentes
router.get('/', auth, async (req, res) => {
  try {
    const docentes = await Docente.find();
    res.json(docentes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reinicializar docentes con configuración correcta
router.post('/reset', auth, verificarRol(['director']), async (req, res) => {
  try {
    // Eliminar todos los docentes existentes
    await Docente.deleteMany({});

    // Crear nuevos docentes con configuración correcta
    const docentes = await Docente.insertMany([
      {
        nombre: "Juan Pérez",
        materias: ["Matemáticas", "Estadística"],
        cargaHorariaMaxima: 10,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "María García",
        materias: ["Química", "Biologia"],
        cargaHorariaMaxima: 10,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Carlos López",
        materias: ["Física", "Robótica"],
        cargaHorariaMaxima: 10,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Ana Martínez",
        materias: ["Lenguaje", "Literatura"],
        cargaHorariaMaxima: 10,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Pedro Rodríguez",
        materias: ["Inglés", "Teatro"],
        cargaHorariaMaxima: 10,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Laura Sánchez",
        materias: ["Ética", "Religion", "Filosofía"],
        cargaHorariaMaxima: 8,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Miguel Torres",
        materias: ["Informática", "Programación"],
        cargaHorariaMaxima: 10,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Carmen Ruiz",
        materias: ["Sociales", "Historia", "Geografía"],
        cargaHorariaMaxima: 10,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Roberto Díaz",
        materias: ["Economía", "Emprendimiento"],
        cargaHorariaMaxima: 8,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Sofía Vargas",
        materias: ["Artes", "Música", "Danza"],
        cargaHorariaMaxima: 8,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Luis Mendoza",
        materias: ["Deportes", "Medio Ambiente"],
        cargaHorariaMaxima: 8,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Patricia Gómez",
        materias: ["Derechos Humanos", "Sociología"],
        cargaHorariaMaxima: 8,
        disponibilidad: generarDisponibilidadCompleta()
      },
      {
        nombre: "Ricardo Soto",
        materias: ["Diseño Gráfico", "Tecnología"],
        cargaHorariaMaxima: 8,
        disponibilidad: generarDisponibilidadCompleta()
      }
    ]);

    res.status(201).json({
      message: "Docentes reinicializados correctamente",
      docentes
    });
  } catch (err) {
    console.error("Error al reinicializar docentes:", err);
    res.status(500).json({ error: err.message });
  }
});

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

// Crear docente
router.post('/', auth, verificarRol(['director']), async (req, res) => {
  try {
    const nuevoDocente = new Docente(req.body);
    await nuevoDocente.save();
    res.status(201).json(nuevoDocente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar docente
router.put('/:id', auth, verificarRol(['director']), async (req, res) => {
  try {
    const docenteActualizado = await Docente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(docenteActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar docente
router.delete('/:id', auth, verificarRol(['director']), async (req, res) => {
  try {
    await Docente.findByIdAndDelete(req.params.id);
    res.json({ message: 'Docente eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
