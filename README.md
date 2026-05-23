# Closira Core — Full Stack Submission

AI-powered customer communication platform for SMBs. This repository contains both the backend API service and the mobile dashboard frontend.

---

## Repository Structure

```
closira-core/
├── backend/          # FastAPI REST API + async worker
└── mobile-app/       # React Native (Expo) mobile dashboard
```

---

## Backend (Python + FastAPI)

See [`backend/README.md`](./backend/README.md) for full setup, schema, and design decisions.

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

**Key decisions:**
- **SQLite + WAL** over PostgreSQL — zero infra for prototype, one-line swap for production
- **BackgroundTasks** over Celery — no broker needed, suitable for single-process prototype
- **5 SOPs** — booking, pricing, complaint, after-hours, general-information
- **Structured JSON logging** via `structlog`

---

## Frontend (React Native + Expo)

See [`mobile-app/README.md`](./mobile-app/README.md) for full setup and design decisions.

```bash
cd mobile-app
npm install
npx expo start
```

**Screens:** Dashboard · Leads · Escalations · Follow-ups · Conversation Detail

---

## Video Walkthrough

[Link to video walkthrough]

---

## If I had more time

- Add Celery + Redis for durable background processing
- Add PostgreSQL with `tenant_id` multi-tenancy
- Wire the frontend to the real API (one-line change per screen — mock data is API-shaped)
- Add Expo push notifications for escalation alerts
- Add JWT authentication on both ends