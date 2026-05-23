# Closira — Backend Service

REST API + async worker powering Closira's inbound enquiry-handling pipeline.

---

## Quick Start

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs → **http://localhost:8000/docs**  
Health check → **http://localhost:8000/health**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API status + DB connectivity |
| `POST` | `/enquiry` | Create inbound enquiry, returns `job_id` immediately |
| `POST` | `/enquiry/{id}/follow-up` | Schedule a follow-up with delay and optional template |
| `POST` | `/enquiry/{id}/escalate` | Manually escalate to a human agent |
| `GET` | `/enquiry/{id}/history` | Full conversation history and status timeline |

---

## Database: SQLite (not PostgreSQL)

**Choice:** SQLite with WAL mode enabled.

**Reasoning:** The assignment asks for a lightweight prototype. SQLite with WAL (Write-Ahead Logging) gives us:
- Zero infrastructure setup — no running Postgres instance needed
- WAL mode allows concurrent readers alongside a writer, which suits our async background task pattern
- `check_same_thread=False` + WAL is safe for FastAPI's single-process dev server

**If this were production:** I would switch to PostgreSQL (via `asyncpg`) with connection pooling (pgBouncer or SQLAlchemy's `pool_size`). The `SQLModel` ORM layer means this is a one-line URL change.

The schema is in `app/models/enquiry_model.py`. SQLModel auto-creates tables on startup via `SQLModel.metadata.create_all(engine)`.

---

## Async Processing: FastAPI BackgroundTasks (not Celery)

**Choice:** `BackgroundTasks` (built into FastAPI/Starlette).

**Reasoning:**

| Factor | BackgroundTasks | Celery |
|--------|----------------|--------|
| Infrastructure | None — runs in-process | Requires Redis/RabbitMQ broker + separate worker process |
| Latency | Near-zero (same process) | Network hop to broker |
| Durability | Lost if process crashes mid-task | Persisted in broker queue |
| Scale | Single process only | Horizontally scalable workers |
| Fit for this spec | ✅ Ideal — lightweight, no infra | Overkill for a prototype |

**Trade-off acknowledged:** BackgroundTasks has no retry mechanism. If the SOP matcher fails mid-way, the enquiry stays in `new` status. In production, I would use Celery with Redis, add `max_retries=3`, and set the task to `bind=True` for self-referencing retries.

---

## SOP Matching Logic

Five hardcoded SOPs in `app/services/sop_matcher.py`:

| SOP Name | Trigger Keywords |
|----------|-----------------|
| `booking_enquiry` | book, reserve, appointment, schedule, slot, tour |
| `pricing_question` | price, cost, quote, how much, rate, tariff, fee |
| `complaint` | broken, fail, issue, unhappy, bad, error, complaint, refund |
| `after_hours` | closed, midnight, weekend, holiday, after-hours |
| `general_information` | info, brochure, catalogue, document, deck, sla |

Matching is first-hit: the message is normalised to lowercase and scanned against each SOP's regex patterns in order. First match wins; no match → auto-escalation.

**Known limitation:** No multi-SOP detection. A message about "price for a weekend booking" matches only `booking_enquiry`. A future improvement would score all SOPs and pick the highest-weight match.

---

## Database Schema

```
Enquiry
├── id               TEXT  PRIMARY KEY  (e.g. "enq_a1b2c3d4")
├── channel          TEXT  ENUM(WhatsApp, email, call)
├── customer_name    TEXT  INDEXED
├── message          TEXT
├── status           TEXT  ENUM(new, qualified, escalated)  DEFAULT new
├── matched_sop      TEXT  NULLABLE
├── suggested_response TEXT NULLABLE
├── escalation_reason  TEXT NULLABLE
├── created_at       DATETIME DEFAULT utcnow
└── timeline         JSON  (list of event dicts with timestamps)
```

The `timeline` column stores an append-only event log as JSON, avoiding a separate `events` table for this prototype. In production, this should be a dedicated `EnquiryEvent` table with a FK to `Enquiry`.

---

## Structured Logging

All key events emit structured JSON logs via `structlog`:

```json
{"event": "enquiry.created",   "enquiry_id": "enq_a1b2c3d4", "channel": "WhatsApp", "timestamp": "..."}
{"event": "worker.sop_matched","enquiry_id": "enq_a1b2c3d4", "sop": "booking_enquiry", "timestamp": "..."}
{"event": "enquiry.escalated", "enquiry_id": "enq_a1b2c3d4", "reason": "...", "timestamp": "..."}
```

---

## Running Tests

```bash
# From /backend directory
python verify_pipeline.py
```

This smoke-tests all 5 pipeline stages end-to-end using FastAPI's `TestClient`.

---

## Known Limitations & Trade-offs

1. **No authentication** — endpoints are open. Production would require JWT/API-key middleware per tenant.
2. **Tenant isolation stubbed** — the schema has no `tenant_id`. Adding it is a one-column migration; all queries would filter by it.
3. **BackgroundTasks not durable** — tasks lost on crash. Celery + Redis for production.
4. **SOP matching is naive** — keyword regex, no NLP. Acceptable for the spec; real system would use embeddings.
5. **SQLite not suitable for multi-process** — fine for dev/demo; Postgres for production.