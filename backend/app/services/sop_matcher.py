import re
from datetime import datetime
from typing import Dict, Optional, Tuple
import structlog
from sqlmodel import Session
from app.models.enquiry_model import Enquiry, EnquiryStatus

logger = structlog.get_logger()

SOP_REGISTRY = {
    "booking_enquiry": {
        "keywords": [r"book", r"reserve", r"appointment", r"schedule", r"slot"],
        "suggested_response": "Thank you for reaching out! I can absolutely help you secure a spot. Could you please share your preferred date and time?"
    },
    "pricing_question": {
        "keywords": [r"price", r"cost", r"quote", r"how much", r"rate", r"tariff"],
        "suggested_response": "Our pricing structures vary based on your business requirements. You can view our baseline packages at plan-rates.closira.com or let me know your scale for a custom quote!"
    },
    "complaint": {
        "keywords": [r"broken", r"fail", r"issue", r"unhappy", r"bad", r"error", r"complaint", r"worst"],
        "suggested_response": "I am incredibly sorry to hear about this experience. I am flagging this immediately for our management team to review and resolve."
    },
    "after_hours": {
        "keywords": [r"closed", r"midnight", r"weekend", r"holiday", r"opening hours"],
        "suggested_response": "Our physical offices are currently closed, but our automated assistants are keeping an eye out. We will get back to you during standard operational hours (9 AM - 5 PM PST)."
    }
}

def analyze_and_match_sop(message_text: str) -> Tuple[Optional[str], Optional[str]]:
    normalized_text = message_text.lower()
    for sop_name, configuration in SOP_REGISTRY.items():
        for pattern in configuration["keywords"]:
            if re.search(pattern, normalized_text):
                return sop_name, configuration["suggested_response"]
    return None, None

def process_async_enquiry(enquiry_id: str, db_engine) -> None:
    with Session(db_engine) as session:
        enquiry = session.get(Enquiry, enquiry_id)
        if not enquiry:
            logger.error("worker.orphan_job", enquiry_id=enquiry_id, error="Record missing in database context")
            return

        sop_match, suggested_reply = analyze_and_match_sop(enquiry.message)
        updated_timeline = list(enquiry.timeline)
        
        if sop_match:
            enquiry.status = EnquiryStatus.QUALIFIED
            enquiry.matched_sop = sop_match
            enquiry.suggested_response = suggested_reply
            updated_timeline.append({
                "event": "sop_matched",
                "sop_name": sop_match,
                "timestamp": datetime.utcnow().isoformat()
            })
            session.add(enquiry)
            logger.info("worker.sop_matched", enquiry_id=enquiry_id, sop=sop_match)
        else:
            enquiry.status = EnquiryStatus.ESCALATED
            enquiry.escalation_reason = "No matching business SOP found for message signature."
            updated_timeline.append({
                "event": "escalation_triggered",
                "reason": "unmatched_sop_signature",
                "timestamp": datetime.utcnow().isoformat()
            })
            session.add(enquiry)
            logger.warn("worker.escalation_triggered", enquiry_id=enquiry_id, reason="No SOP matched text signature")

        enquiry.timeline = updated_timeline
        session.commit()
