import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - fetch current queue
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT * FROM queue ORDER BY token_number ASC`
    );
    const waiting = result.rows.filter(r => r.status === 'waiting');
    const current = result.rows.find(r => r.status === 'called');
    const avgTime = result.rows[0]?.avg_consultation_time || 10;

    return NextResponse.json({
      queue: waiting,
      current_token: current || null,
      total_waiting: waiting.length,
      avg_consultation_time: avgTime
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }
}

// POST - add new patient
export async function POST(req: NextRequest) {
  try {
    const { patient_name, avg_consultation_time } = await req.json();

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM queue WHERE DATE(created_at) = CURRENT_DATE`
    );
    const token_number = parseInt(countResult.rows[0].count) + 1;

    const result = await pool.query(
      `INSERT INTO queue (token_number, patient_name, avg_consultation_time)
       VALUES ($1, $2, $3) RETURNING *`,
      [token_number, patient_name, avg_consultation_time || 10]
    );

    // Emit socket event
    if (global.io) {
      global.io.emit('queue_updated');
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add patient' }, { status: 500 });
  }
}

// PATCH - call next token
export async function PATCH() {
  try {
    // Set current called token to done
    await pool.query(
      `UPDATE queue SET status = 'done' WHERE status = 'called'`
    );

    // Call next waiting token
    const next = await pool.query(
      `UPDATE queue SET status = 'called', called_at = NOW()
       WHERE id = (
         SELECT id FROM queue WHERE status = 'waiting'
         ORDER BY token_number ASC LIMIT 1
       ) RETURNING *`
    );

    // Emit socket event
    if (global.io) {
      global.io.emit('queue_updated');
    }

    if (next.rows.length === 0) {
      return NextResponse.json({ message: 'No more patients in queue' });
    }

    return NextResponse.json(next.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to call next' }, { status: 500 });
  }
} 