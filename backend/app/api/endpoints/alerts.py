from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import User
from app.api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class AlertBase(BaseModel):
    symbol: str
    condition: str  # "above", "below"
    type: str       # "price", "risk", "execution"
    value: float
    message: str

class AlertCreate(AlertBase):
    pass

class AlertRead(AlertBase):
    id: str
    created_at: datetime
    status: str  # "active", "triggered", "dismissed"

# In-memory store for simulation (can be moved to DB later)
TEMP_ALERTS = []

@router.get("", response_model=List[AlertRead])
async def get_alerts(current_user: User = Depends(get_current_user)):
    """Fetch all active alerts for the current user."""
    # Filter by user if using real DB
    return [a for a in TEMP_ALERTS if a["status"] == "active"]

@router.post("", response_model=AlertRead)
async def create_alert(alert: AlertCreate, current_user: User = Depends(get_current_user)):
    """Create a new price or risk alert."""
    new_alert = {
        **alert.dict(),
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(),
        "status": "active"
    }
    TEMP_ALERTS.append(new_alert)
    return new_alert

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, current_user: User = Depends(get_current_user)):
    """Dismiss or delete an alert."""
    global TEMP_ALERTS
    TEMP_ALERTS = [a for a in TEMP_ALERTS if a["id"] != alert_id]
    return {"status": "deleted"}

@router.get("/notifications")
async def get_latest_notifications(current_user: User = Depends(get_current_user)):
    """Get triggered alerts that should be shown as notifications."""
    # Simulation: generate a random notification occasionally
    import random
    notifs = []
    if random.random() > 0.7:
        notifs.append({
            "id": "sys-" + str(random.randint(100, 999)),
            "type": "risk",
            "title": "Margin Alert",
            "message": "Portfolio utilization exceeds 75%. Consider reducing exposure.",
            "severity": "high",
            "time": datetime.now().strftime("%H:%M:%S")
        })
    return notifs
