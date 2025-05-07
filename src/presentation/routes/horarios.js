const express = require("express");
const router = express.Router();
const Horario = require("../../data/models/Horario");
const { auth, verificarRol } = require("../../business/middleware/auth");

// Obtener horarios (todos pueden ver)
router.get("/", auth, async (req, res) => {
  try {
    const horarios = await Horario.find();
    res.json(horarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear horario (solo director)
router.post("/", auth, verificarRol(["director"]), async (req, res) => {
  try {
    const nuevoHorario = new Horario(req.body);
    await nuevoHorario.save();
    res.status(201).json(nuevoHorario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Nueva ruta para la generación de horarios
router.post("/generate", auth, verificarRol(["director"]), async (req, res) => {
  try {
    const { materia, docente, dia, bloque } = req.body;

    // Validar que todos los campos estén presentes
    if (!materia || !docente || dia === undefined || bloque === undefined) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Crear el nuevo horario
    const nuevoHorario = new Horario({ materia, docente, dia, bloque });
    await nuevoHorario.save();

    res.status(201).json({ message: "Horario creado exitosamente", horario: nuevoHorario });
  } catch (error) {
    console.error("Error al generar el horario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Editar horario (solo director)
router.put("/:id", auth, verificarRol(["director"]), async (req, res) => {
  try {
    const horarioActualizado = await Horario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(horarioActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar horario (solo director)
router.delete("/:id", auth, verificarRol(["director"]), async (req, res) => {
  try {
    await Horario.findByIdAndDelete(req.params.id);
    res.json({ message: "Horario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
