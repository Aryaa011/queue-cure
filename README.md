# 🏥 Queue Cure '26

A real-time hospital queue management system that eliminates paper token slips and waiting room chaos.

## 🚀 Live Demo
- **Receptionist Portal:** https://queue-cure-eosin.vercel.app/
- **Patient Waiting Room:** https://queue-cure-eosin.vercel.app/waiting

## 📋 Problem Statement
76% of India's 1.5 million clinics still run on paper token slips. Patients wait 2-3 hours with zero visibility into when they'll be called. Doctors have no dashboard. Receptionists manage everything from memory.

**Queue Cure fixes that.**

## ✨ Features

### Receptionist Portal
- Register patients with auto-generated token numbers
- Set average consultation time per patient
- Call next patient with one click
- View full waiting queue with estimated wait times
- Real-time validation and error handling

### Patient Waiting Room
- See current token being served (large display)
- View upcoming tokens and estimated wait times
- Auto-updates every 3 seconds — no refresh needed
- Works on any device — TV, phone, tablet

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| Real-time | Socket.io + Polling fallback |
| Deployment | Vercel |

## 🗄️ Database Schema

```sql
CREATE TABLE queue (
  id SERIAL PRIMARY KEY,
  token_number INT NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting',
  avg_consultation_time INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  called_at TIMESTAMP
);
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/queue | Fetch current queue state |
| POST | /api/queue | Register new patient |
| PATCH | /api/queue | Call next patient |

## ⚡ How Real-time Works
1. Receptionist clicks "Call Next Patient"
2. Server updates database
3. Socket.io broadcasts `queue_updated` event
4. All connected screens fetch fresh data instantly
5. Polling fallback (3s) ensures updates even without WebSocket

## 🏃 Run Locally

```bash
git clone https://github.com/Aryaa011/queue-cure.git
cd queue-cure
npm install
```  

Create `.env.local`:
```
DATABASE_URL=your_neon_postgresql_url
```

```bash
node server.js
```

Open http://localhost:3000

## 👤 Author
Arya Jain | Computer Engineering Student | SAL Engineering Institute, Ahmedabad