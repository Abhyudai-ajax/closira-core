from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlmodel import Session, text
from app.core.database import get_session

router = APIRouter(tags=["System Reliability"])


@router.get(
    "/health",
    summary="API and database health check",
    description="Returns API status and confirms database connectivity.",
)
def health_check(session: Session = Depends(get_session)):
    try:
        session.exec(text("SELECT 1")).one()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "database": f"error: {str(e)}"},
        )