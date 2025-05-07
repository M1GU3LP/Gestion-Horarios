const express = require('express');
const router = express.Router();
const Materia = require('../../data/models/Materia');

router.get('/', async (req, res) => {
  const materias = await Materia.find();
  res.json(materias);
});

module.exports = router;
