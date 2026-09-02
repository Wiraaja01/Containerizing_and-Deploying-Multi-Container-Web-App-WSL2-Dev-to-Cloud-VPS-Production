const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const redisClient = require('../config/redis');

// GET / - Hit Counter (Redis) & Fetch Users (PostgreSQL)
router.get('/', async (req, res) => {
  try {
    const visits = await redisClient.incr('page_views');
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id DESC');
    
    res.json({
      message: "Success connecting to PostgreSQL & Redis (Modular Architecture)!",
      total_page_views: visits,
      users_count: rows.length,
      users: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users - Tambah Data User Baru
router.post('/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ message: "User added successfully", user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
