import re
from datetime import datetime
from typing import Optional, Tuple
import structlog
from sqlmodel import Session
from app.models.enquiry_model import Enquiry, EnquiryStatus

logger = structlog.get_logger()

# ---------------------------------------------------------------------------
# SOP Registry — 5 hardcoded Standard Operating Procedures
# Keyword patterns use simple regex; no AI/ML required per spec.
# ---------------------------------------------------------------------------
SOP_REGISTRY = {
    "booking_enquiry": {
        "keywords": [r"book", r"reserve", r"appointment", r"schedule", r"slot", r"tour"],
        "suggested_response": (
            "Thank you for reaching out! I can absolutely help you secure a spot. "
            "Could you please share your preferred date and time?"
        ),
    },
    "pricing_question": {
        "keywords": [r"price", r"cost", r"quote", r"how much", r"rate", r"tariff", r"fee"],
        "suggested_response": (
            "Our pricing varies based on your business requirements. "
            "You can view baseline packages at closira.com/pricing or share your scale for a custom quote."
        ),
    },
    "complaint": {
        "keywords": [r"broken", r"fail", r"issue", r"unhappy", r"bad", r"error", r"complaint", r"worst", r"refund"],
        "suggested_response": (
            "I'm truly sorry to hear about this experience. "
            "I'm flagging this immediately for our management team to review and resolve for you."
        ),
    },
    "after_hours": {
        "keywords": [r"closed", r"midnight", r"weekend", r"holiday", r"opening hours", r"after.?hours"],
        "suggested_response": (
            "Our offices are currently closed, but our assistants are monitoring. "
            "We'll get back to you during standard hours (9 AM–6 PM IST)."
        ),
    },
    "general_information": {
        "keywords": [r"info", r"detail", r"brochure", r"catalogue", r"document", r"deck", r"sla", r"learn more"],
        "suggested_response": (
            "Happy to help! I'll send over our product overview and relevant documentation shortly. "
            "Is there a specific area you'd like us to focus on?"
        ),
    },
}


def analyze_and_match_sop(message_text: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Scan message against each SOP's keyword list.
    Returns (sop_name, suggested_response) on first match, else (None, None).
    First-match ordering means more specific SOPs should be listed first.
    """
    normalized = message_text.lower()
    for sop_name, config in SOP_REGISTRY.items():
        for pattern in config["keywords"]:
            if re.search(pattern, normalized):
                return sop_name, config["suggested_response"]
    return None, None


def process_async_enquiry(enquiry_id: str, db_engine) -> None:
    """
    Background task: match inbound message to an SOP and update enquiry record.
    If no SOP matches, escalates automatically and logs the event.
    """
    with Session(db_engine) as session:
        enquiry = session.get(Enquiry, enquiry_id)
        if not enquiry:
            logger.error(
                "worker.orphan_job",
                enquiry_id=enquiry_id,
                error="Record missing from database",
            )
            return

        sop_match, suggested_reply = analyze_and_match_sop(enquiry.message)
        updated_timeline = list(enquiry.timeline)

        if sop_match:
            enquiry.status = EnquiryStatus.QUALIFIED
            enquiry.matched_sop = sop_match
            enquiry.suggested_response = suggested_reply
            updated_timeline.append(
                {
                    "event": "sop_matched",
                    "sop_name": sop_match,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
            logger.info("worker.sop_matched", enquiry_id=enquiry_id, sop=sop_match)
        else:
            enquiry.status = EnquiryStatus.ESCALATED
            enquiry.escalation_reason = "No matching SOP found for message content."
            updated_timeline.append(
                {
                    "event": "escalation_triggered",
                    "reason": "unmatched_sop",
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
            logger.warning(
                "worker.escalation_triggered",
                enquiry_id=enquiry_id,
                reason="No SOP matched",
            )

        enquiry.timeline = updated_timeline
        session.add(enquiry)
        session.commit()