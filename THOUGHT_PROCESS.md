# Queue Cure '26 — Thought Process Sheet

## Problem Understanding
India's clinics run on paper tokens and shouting. Patients have zero visibility 
into wait times. Receptionists manage everything from memory. This causes:
- 2-3 hour unpredictable waits
- Patient anxiety from uncertainty
- Receptionist errors under pressure

The core insight: **patients don't mind waiting — they mind not knowing how long.**

---

## Solution Approach

### Two screens, one purpose
- **Receptionist screen** — fast, mistake-proof token management
- **Patient screen** — large, clear display visible from across a waiting room

### Why real-time matters
A static page that refreshes every 30s creates anxiety ("did it update?").
Socket.io + polling gives instant feedback — the moment a token is called,
every patient screen updates within 3 seconds.

---

## Technical Decisions

### Next.js API Routes (not separate backend)
- Single repo, single deployment
- No CORS issues
- Faster to build for a hackathon

### Neon PostgreSQL (not in-memory)
- Data survives server restarts
- Token numbers persist across the day
- Real audit trail of when patients were called

### Socket.io + Polling fallback
- Socket.io gives instant updates on local network
- Polling every 3s ensures Vercel (serverless) still works
- Best of both worlds — fast locally, reliable in production

### Token numbers reset daily
```sql
WHERE DATE(created_at) = CURRENT_DATE
```
Each day starts fresh from token #1. No manual reset needed.

---

## Edge Cases Handled

| Edge Case | How handled |
|-----------|-------------|
| Empty name submission | Client-side validation with inline error |
| Call next when queue empty | Button shows error, no DB call made |
| Two receptionists simultaneously | DB sequential count prevents duplicate tokens |
| Server restart mid-day | Tokens persist in PostgreSQL |
| No WebSocket support (Vercel) | 3-second polling fallback |

---

## What I Would Add With More Time
- Patient self-registration via QR code
- SMS notification when your token is next
- Doctor dashboard showing patient history
- Multi-counter support (multiple doctors)
- Daily analytics — peak hours, avg wait times

---

## Tech Stack Summary

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js + Tailwind | Fast development, great defaults |
| Backend | Next.js API Routes | Same repo as frontend |
| Database | Neon PostgreSQL | Free, cloud, persistent |
| Real-time | Socket.io + polling | Works locally and on Vercel |
| Deployment | Vercel | One-click, free tier |

---

*Built by Arya Jain | Computer Engineering | SAL Engineering Institute, Ahmedabad*  