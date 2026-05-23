from fastapi import FastAPI
from app.api import enquiry, health
from app.core.database import init_db
from app.core.config import setup_logging

setup_logging()

app = FastAPI(
    title="Closira Inbound Routing Engine",
    description="Asynchronous omnichannel routing platform processing SOP matching & business lead escalation pipelines.",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(health.router)
app.include_router(enquiry.router)
