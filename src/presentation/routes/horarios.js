const express = require("express");
const router = express.Router();
const Horario = require("../../data/models/Horario");
const Materia = require("../../data/models/Materia");
const Docente = require("../../data/models/Docente");
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

    // Verificar si el docente ya tiene un horario en el mismo día y bloque
    const horarioExistente = await Horario.findOne({ docente, dia, bloque });
    if (horarioExistente) {
      return res.status(400).json({ error: "El docente ya tiene un horario asignado en este día y bloque." });
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

// Ruta para la generación automática de horarios
router.post("/generate-automatic", auth, verificarRol(["director"]), async (req, res) => {
  try {
    const materias = await Materia.find();
    const docentes = await Docente.find();

    if (!materias.length || !docentes.length) {
      return res.status(400).json({ error: "No hay suficientes materias o docentes para generar horarios." });
    }

    const horarios = [];

    // Algoritmo heurístico para asignar materias y docentes
    for (const materia of materias) {
      let horasRestantes = materia.cargaHoraria;

      for (const docente of docentes) {
        if (horasRestantes <= 0) break;

        for (const bloque of docente.disponibilidad) {
          if (horasRestantes <= 0) break;

          // Verificar si el docente ya tiene un horario en este bloque
          const conflicto = horarios.find(
            (h) => h.docente === docente.nombre && h.dia === bloque.dia && h.bloque === bloque.bloque
          );

          if (!conflicto) {
            horarios.push({
              materia: materia.nombre,
              docente: docente.nombre,
              dia: bloque.dia,
              bloque: bloque.bloque,
            });
            horasRestantes--;
          }
        }
      }
    }

    // Validar y optimizar el horario generado
    if (!horarios.length) {
      return res.status(400).json({ error: "No se pudo generar un horario válido." });
    }

    // Guardar los horarios generados en la base de datos
    await Horario.insertMany(horarios);

    res.status(201).json({ message: "Horarios generados exitosamente.", horarios });
  } catch (error) {
    console.error("Error al generar horarios automáticamente:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Nueva función para la generación automática de horarios
router.post("/generate-optimized", auth, verificarRol(["director"]), async (req, res) => {
  try {
    console.log("1. Iniciando generación de horarios optimizados...");
    
    // Obtener datos actualizados de la base de datos
    const docentesDB = await Docente.find().lean();
    const materiasDB = await Materia.find().lean();
    const { restricciones } = req.body;

    if (!docentesDB.length || !materiasDB.length) {
      return res.status(400).json({
        error: "No hay suficientes docentes o materias en la base de datos"
      });
    }

    // Matriz para almacenar el horario (5 días x 8 bloques)
    const horarioMatrix = Array(5).fill().map(() => Array(8).fill(null));
    const horariosGenerados = [];
    const cargaHorariaDocentes = {};
    const materiasAsignadasPorDia = Array(5).fill().map(() => ({}));

    // Inicializar contadores de carga horaria
    docentesDB.forEach(docente => {
      cargaHorariaDocentes[docente.nombre] = {
        total: 0,
        porDia: Array(5).fill(0),
        materiasAsignadas: new Set()
      };
    });

    // Función para verificar disponibilidad del docente
    const isDocenteDisponible = (docente, dia, bloque, materia) => {
      // Verificar si ya tiene asignación en ese horario
      const tieneHorario = horariosGenerados.some(h => 
        h.docente === docente.nombre && h.dia === dia && h.bloque === bloque
      );
      if (tieneHorario) return false;

      // Verificar carga horaria máxima
      if (cargaHorariaDocentes[docente.nombre].total >= docente.cargaHorariaMaxima) {
        return false;
      }

      // Verificar carga diaria
      if (cargaHorariaDocentes[docente.nombre].porDia[dia] >= restricciones.distribucionDocentePorDia) {
        return false;
      }

      // Verificar si la materia ya fue asignada este día
      if (materiasAsignadasPorDia[dia][materia] >= (restricciones.distribucionPorDia[materia] || 1)) {
        return false;
      }

      // Verificar bloques consecutivos
      const tieneBloquePrevio = horariosGenerados.some(h => 
        h.docente === docente.nombre && h.dia === dia && h.bloque === bloque - 1
      );
      const tieneBloquePosterior = horariosGenerados.some(h => 
        h.docente === docente.nombre && h.dia === dia && h.bloque === bloque + 1
      );

      return !tieneBloquePrevio && !tieneBloquePosterior;
    };

    // Ordenar materias por carga horaria (descendente)
    const materiasPriorizadas = [...materiasDB].sort((a, b) => b.cargaHoraria - a.cargaHoraria);

    // Función para encontrar el mejor docente disponible
    const encontrarMejorDocente = (materia, dia, bloque, docentesDisponibles) => {
      return docentesDisponibles.sort((a, b) => {
        // Priorizar docentes con menor carga total
        const cargaDiff = cargaHorariaDocentes[a.nombre].total - cargaHorariaDocentes[b.nombre].total;
        if (cargaDiff !== 0) return cargaDiff;

        // Priorizar docentes con menor carga en el día actual
        return cargaHorariaDocentes[a.nombre].porDia[dia] - cargaHorariaDocentes[b.nombre].porDia[dia];
      }).find(docente => isDocenteDisponible(docente, dia, bloque, materia.nombre));
    };

    // Nueva lógica: asignación por rondas para que todas las materias tengan oportunidad
    let horasRestantesPorMateria = {};
    materiasPriorizadas.forEach(m => horasRestantesPorMateria[m.nombre] = m.cargaHoraria);
    let materiasPendientes = materiasPriorizadas.map(m => m.nombre);
    let diasDeportes = new Set();
    let ronda = 0;
    while (materiasPendientes.length > 0 && ronda < 50) {
      let bloquesPorDia = Array(5).fill().map(() => 0); // Reiniciar en cada ronda
      for (let dia = 0; dia < 5; dia++) {
        if (bloquesPorDia[dia] >= 2) continue;
        for (let i = 0; i < materiasPendientes.length; i++) {
          const nombreMateria = materiasPendientes[i];
          if (horasRestantesPorMateria[nombreMateria] <= 0) continue;
          const materia = materiasPriorizadas.find(m => m.nombre === nombreMateria);
          const docentesDisponibles = docentesDB.filter(d => d.materias.includes(nombreMateria));
          let bloqueAsignado = false;
          // Si es Deportes, solo un bloque por día y en días distintos y no consecutivos
          if (nombreMateria === "Deportes") {
            if (diasDeportes.has(dia) || diasDeportes.has(dia - 1) || diasDeportes.has(dia + 1)) continue;
            for (let bloque = 0; bloque < 8; bloque++) {
              if (!horarioMatrix[dia][bloque]) {
                const docenteDisponible = encontrarMejorDocente(materia, dia, bloque, docentesDisponibles);
                if (docenteDisponible) {
                  horarioMatrix[dia][bloque] = {
                    materia: nombreMateria,
                    docente: docenteDisponible.nombre
                  };
                  cargaHorariaDocentes[docenteDisponible.nombre].total++;
                  cargaHorariaDocentes[docenteDisponible.nombre].porDia[dia]++;
                  cargaHorariaDocentes[docenteDisponible.nombre].materiasAsignadas.add(nombreMateria);
                  materiasAsignadasPorDia[dia][nombreMateria] = (materiasAsignadasPorDia[dia][nombreMateria] || 0) + 1;
                  horariosGenerados.push({ materia: nombreMateria, docente: docenteDisponible.nombre, dia, bloque });
                  horasRestantesPorMateria[nombreMateria]--;
                  bloquesPorDia[dia]++;
                  diasDeportes.add(dia);
                  break;
                }
              }
            }
            continue;
          }
          // Intentar primero bloques consecutivos si hay al menos 2 horas restantes y espacio
          if (horasRestantesPorMateria[nombreMateria] >= 2 && bloquesPorDia[dia] <= 0) {
            for (let bloque = 0; bloque < 7; bloque++) {
              if (!horarioMatrix[dia][bloque] && !horarioMatrix[dia][bloque + 1]) {
                const docenteDisponible1 = encontrarMejorDocente(materia, dia, bloque, docentesDisponibles);
                const docenteDisponible2 = encontrarMejorDocente(materia, dia, bloque + 1, docentesDisponibles);
                if (docenteDisponible1 && docenteDisponible2) {
                  horarioMatrix[dia][bloque] = {
                    materia: nombreMateria,
                    docente: docenteDisponible1.nombre
                  };
                  horarioMatrix[dia][bloque + 1] = {
                    materia: nombreMateria,
                    docente: docenteDisponible2.nombre
                  };
                  cargaHorariaDocentes[docenteDisponible1.nombre].total++;
                  cargaHorariaDocentes[docenteDisponible1.nombre].porDia[dia]++;
                  cargaHorariaDocentes[docenteDisponible1.nombre].materiasAsignadas.add(nombreMateria);
                  cargaHorariaDocentes[docenteDisponible2.nombre].total++;
                  cargaHorariaDocentes[docenteDisponible2.nombre].porDia[dia]++;
                  cargaHorariaDocentes[docenteDisponible2.nombre].materiasAsignadas.add(nombreMateria);
                  materiasAsignadasPorDia[dia][nombreMateria] = (materiasAsignadasPorDia[dia][nombreMateria] || 0) + 2;
                  horariosGenerados.push({ materia: nombreMateria, docente: docenteDisponible1.nombre, dia, bloque });
                  horariosGenerados.push({ materia: nombreMateria, docente: docenteDisponible2.nombre, dia, bloque: bloque + 1 });
                  horasRestantesPorMateria[nombreMateria] -= 2;
                  bloquesPorDia[dia] += 2;
                  bloqueAsignado = true;
                  break;
                }
              }
            }
          }
          // Si no se pudo asignar bloques consecutivos, intentar bloque individual
          if (!bloqueAsignado && bloquesPorDia[dia] < 2 && horasRestantesPorMateria[nombreMateria] > 0) {
            for (let bloque = 0; bloque < 8; bloque++) {
              if (!horarioMatrix[dia][bloque]) {
                const docenteDisponible = encontrarMejorDocente(materia, dia, bloque, docentesDisponibles);
                if (docenteDisponible) {
                  horarioMatrix[dia][bloque] = {
                    materia: nombreMateria,
                    docente: docenteDisponible.nombre
                  };
                  cargaHorariaDocentes[docenteDisponible.nombre].total++;
                  cargaHorariaDocentes[docenteDisponible.nombre].porDia[dia]++;
                  cargaHorariaDocentes[docenteDisponible.nombre].materiasAsignadas.add(nombreMateria);
                  materiasAsignadasPorDia[dia][nombreMateria] = (materiasAsignadasPorDia[dia][nombreMateria] || 0) + 1;
                  horariosGenerados.push({ materia: nombreMateria, docente: docenteDisponible.nombre, dia, bloque });
                  horasRestantesPorMateria[nombreMateria]--;
                  bloquesPorDia[dia]++;
                  break;
                }
              }
            }
          }
        }
      }
      materiasPendientes = materiasPriorizadas.filter(m => horasRestantesPorMateria[m.nombre] > 0).map(m => m.nombre);
      ronda++;
    }

    if (horariosGenerados.length === 0) {
      return res.status(400).json({
        error: "No se pudo generar ningún horario válido"
      });
    }

    // Validar y mostrar distribución final
    const distribucionFinal = {};
    for (const horario of horariosGenerados) {
      if (!distribucionFinal[horario.docente]) {
        distribucionFinal[horario.docente] = {
          total: 0,
          materias: new Set(),
          porDia: Array(5).fill(0)
        };
      }
      distribucionFinal[horario.docente].total++;
      distribucionFinal[horario.docente].materias.add(horario.materia);
      distribucionFinal[horario.docente].porDia[horario.dia]++;
    }

    console.log("Distribución final de carga horaria:", 
      Object.entries(distribucionFinal).map(([docente, info]) => ({
        docente,
        total: info.total,
        materias: Array.from(info.materias),
        distribucionDiaria: info.porDia
      }))
    );

    // Guardar los horarios generados
    await Horario.deleteMany({});
    await Horario.insertMany(horariosGenerados);

    res.status(200).json({
      message: "Horarios generados exitosamente",
      horarios: horariosGenerados,
      distribucion: distribucionFinal,
      estadisticas: {
        totalHorasAsignadas: horariosGenerados.length,
        distribucionPorMateria: Object.fromEntries(
          materiasPriorizadas.map(m => [
            m.nombre,
            horariosGenerados.filter(h => h.materia === m.nombre).length
          ])
        )
      }
    });

  } catch (error) {
    console.error("Error en la generación de horarios:", error);
    res.status(500).json({
      error: "Error al generar los horarios",
      details: error.message
    });
  }
});

// Ruta temporal para verificar datos en las colecciones
router.get("/verify-collections", auth, verificarRol(["director"]), async (req, res) => {
  try {
    console.log("Fetching docentes and materias collections...");
    const docentes = await Docente.find({}, { disponibilidad: 1, _id: 0 });
    const materias = await Materia.find({}, { cargaHoraria: 1, _id: 0 });

    console.log("Docentes:", docentes);
    console.log("Materias:", materias);

    res.status(200).json({
      docentes,
      materias,
    });
  } catch (error) {
    console.error("Error al verificar las colecciones:", error);
    res.status(500).json({ error: "Error interno del servidor." });
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
