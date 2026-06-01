const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api' });
});

app.get('/api/data', async (req, res) => {
  try {
    // A simple query to ensure DB is connected, handling the case where it might not be initialized
    if (process.env.DATABASE_URL) {
      const result = await pool.query('SELECT NOW() as current_time');
      res.json({ 
        message: 'Hello from the API microservice!', 
        db_time: result.rows[0].current_time,
        connectedToDB: true 
      });
    } else {
      res.json({ 
        message: 'Hello from the API microservice!', 
        connectedToDB: false,
        warning: 'DATABASE_URL not set'
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`API Microservice running on port ${port}`);
});
