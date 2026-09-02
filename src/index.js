const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Setup PostgreSQL Connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  user: process.env.POSTGRES_USER || 'myuser',
  password: process.env.POSTGRES_PASSWORD || 'mypassword',
  database: process.env.POSTGRES_DB || 'myappdb',
  port: 5432,
});

// Setup Redis Client
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'cache'}:6379`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function initDB() {
  await redisClient.connect();
  console.log('Connected to Redis Cache');

  // Buat tabel otomatis jika belum ada
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('PostgreSQL Table Ready');
}

initDB().catch(console.error);

// Endpoint 1: Hit Counter (Redis) & Tampilkan User (PostgreSQL)
app.get('/', async (req, res) => {
  try {
    const visits = await redisClient.incr('page_views');
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id DESC');
    
    res.json({
      message: "Success connecting to PostgreSQL & Redis!",
      total_page_views: visits,
      users_count: rows.length,
      users: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint 2: Tambah Data User Baru (PostgreSQL)
app.post('/users', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




