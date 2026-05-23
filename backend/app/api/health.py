from fastapi import APIRouter, Depends
from sqlmodel import Session, text
from app.core.database import get_session

router = APIRouter(tags=["System Reliability"])

@router.get("/health")
def health_check(session: Session = Depends(get_session)):
    try:
        session.exec(text("SELECT 1")).one()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": f"error: {str(e)}"}, 500
