from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field, JSON

class ChannelType(str, Enum):
    WHATSAPP = "WhatsApp"
    EMAIL = "email"
    CALL = "call"

class EnquiryStatus(str, Enum):
    NEW = "new"
    QUALIFIED = "qualified"
    ESCALATED = "escalated"

class Enquiry(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    channel: ChannelType
    customer_name: str = Field(index=True)
    message: str
    status: EnquiryStatus = Field(default=EnquiryStatus.NEW)
    matched_sop: Optional[str] = None
    suggested_response: Optional[str] = None
    escalation_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    timeline: List[Dict] = Field(default_factory=list, sa_type=JSON)

class EnquiryCreate(SQLModel):
    channel: ChannelType = Field(..., description="Inbound contact channel")
    customer_name: str = Field(..., description="Customer legal or visible name")
    message: str = Field(..., description="Raw message transcript or text received")

class FollowUpRequest(SQLModel):
    delay_minutes: int = Field(..., ge=1, description="Minutes to delay the action")
    message_template: Optional[str] = Field(None, description="Optional baseline context template")

class EscalationRequest(SQLModel):
    reason: str = Field(..., min_length=3, description="Justification for human handoff")
