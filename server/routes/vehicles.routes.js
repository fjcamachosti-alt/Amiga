
const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware simple de autenticación (ejemplo)
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        // Lógica de verificación JWT real iría aquí
        next();
    } else {
        res.sendStatus(403);
    }
};

// Obtener todos los vehículos
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un vehículo
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({message: 'Vehículo no encontrado'});
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Crear vehículo
router.post('/', verifyToken, async (req, res) => {
  try {
    const { matricula, marca, modelo, ano, estado, visibilidad } = req.body;
    const result = await db.query(
      'INSERT INTO vehicles (matricula, marca, modelo, ano, estado, visibilidad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [matricula, marca, modelo, ano, estado, visibilidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
