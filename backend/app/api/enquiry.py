import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlmodel import Session
import structlog
from app.core.database import get_session, engine
from app.models.enquiry_model import Enquiry, EnquiryCreate, FollowUpRequest, EscalationRequest, EnquiryStatus
from app.services.sop_matcher import process_async_enquiry

logger = structlog.get_logger()
router = APIRouter(prefix="/enquiry", tags=["Enquiry Pipeline"])

@router.post("", status_code=status.HTTP_202_ACCEPTED, summary="Ingest an inbound customer enquiry")
def create_enquiry(payload: EnquiryCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    job_id = f"enq_{uuid.uuid4().hex[:8]}"
    new_enquiry = Enquiry(
        id=job_id,
        channel=payload.channel,
        customer_name=payload.customer_name,
        message=payload.message,
        timeline=[{"event": "enquiry_created", "timestamp": datetime.utcnow().isoformat()}]
    )
    session.add(new_enquiry)
    session.commit()
    logger.info("enquiry.created", enquiry_id=job_id, channel=payload.channel)
    background_tasks.add_task(process_async_enquiry, job_id, engine)
    return {"job_id": job_id, "status": "queued"}

@router.post("/{id}/follow-up", summary="Schedule an action follow-up")
def schedule_follow_up(id: str, payload: FollowUpRequest, session: Session = Depends(get_session)):
    enquiry = session.get(Enquiry, id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry resource not found")
    updated_timeline = list(enquiry.timeline)
    updated_timeline.append({"event": "follow_up_scheduled", "delay_minutes": payload.delay_minutes, "timestamp": datetime.utcnow().isoformat()})
    enquiry.timeline = updated_timeline
    session.add(enquiry)
    session.commit()
    logger.info("enquiry.follow_up_scheduled", enquiry_id=id, delay_minutes=payload.delay_minutes)
    return {"status": "success", "message": f"Follow-up registered for execution in {payload.delay_minutes}m."}

@router.post("/{id}/escalate", summary="Escalate execution to a physical agent")
def escalate_enquiry(id: str, payload: EscalationRequest, session: Session = Depends(get_session)):
    enquiry = session.get(Enquiry, id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry resource not found")
    enquiry.status = EnquiryStatus.ESCALATED
    enquiry.escalation_reason = payload.reason
    updated_timeline = list(enquiry.timeline)
    updated_timeline.append({"event": "escalated_manually", "reason": payload.reason, "timestamp": datetime.utcnow().isoformat()})
    enquiry.timeline = updated_timeline
    session.add(enquiry)
    session.commit()
    logger.info("enquiry.escalated", enquiry_id=id, reason=payload.reason)
    return {"status": "success", "current_status": enquiry.status}

@router.get("/{id}/history", summary="Fetch deep telemetry tracking layout")
def get_enquiry_history(id: str, session: Session = Depends(get_session)):
    enquiry = session.get(Enquiry, id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry tracking path missing")
    return {
        "id": enquiry.id,
        "channel": enquiry.channel,
        "customer_name": enquiry.customer_name,
        "message": enquiry.message,
        "status": enquiry.status,
        "matched_sop": enquiry.matched_sop,
        "suggested_response": enquiry.suggested_response,
        "escalation_reason": enquiry.escalation_reason,
        "timeline": enquiry.timeline
    }
