const express = require('express');
const router = express.Router();
const Docente = require('../../data/models/Docente');
const { auth, verificarRol } = require('../../business/middleware/auth');

router.get('/', async (req, res) => {
  const docentes = await Docente.find();
  res.json(docentes);
});

router.post("/", auth, verificarRol(["director"]), async (req, res) => {
  const docente = new Docente(req.body);
  await docente.save();
  res.status(201).json(docente);
});

module.exports = router;
