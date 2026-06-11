const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_ICb2f5ZWyAlt@ep-twilight-dust-apbhn6b2.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS queue (
      id SERIAL PRIMARY KEY,
      token_number INT NOT NULL,
      patient_name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'waiting',
      avg_consultation_time INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT NOW(),
      called_at TIMESTAMP
    )
  `);
  console.log('Queue table created!');
  process.exit(0);
}

setup(); 