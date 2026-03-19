from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import User
from app.api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime
import uuid
import time
from app.services.broker_service import BrokerService
from app.models.models import BrokerAccount

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

# In-memory store for simulation
TEMP_ALERTS = []
LAST_MARGIN_ALERT_TIME = 0  # Global cooldown tracker

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
async def get_latest_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get triggered alerts based on real market/broker conditions."""
    global LAST_MARGIN_ALERT_TIME
    notifs = []
    
    # 1. Check if Broker is Connected (Fix 4)
    broker = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == current_user.id,
        BrokerAccount.type == "Angel One"
    ).first()
    
    if not broker:
        return [] # Don't show alerts if no broker connected

    # 2. Prevent Spam (Fix 3: 60s Cooldown)
    current_time = time.time()
    if current_time - LAST_MARGIN_ALERT_TIME < 60:
        return []

    try:
        # 3. Fetch Real Funds (Fix 1: rmsLimit)
        service = BrokerService(db)
        service.login(broker)
        rms = service.get_rms_limit()
        
        # Calculation (Example fields from Angel One API)
        available_cash = float(rms.get('availablecash', 0))
        used_margin = float(rms.get('utiliseddebit', 0))
        total_margin = available_cash + used_margin
        
        margin_used_pct = (used_margin / total_margin * 100) if total_margin > 0 else 0
        
        # 4. Condition Before Alert (Fix 2: threshold > 75)
        if margin_used_pct > 75:
            LAST_MARGIN_ALERT_TIME = current_time
            notifs.append({
                "id": "risk-" + str(uuid.uuid4())[:8],
                "type": "risk",
                "title": "Institutional Margin Warning",
                "message": f"Portfolio utilization at {round(margin_used_pct, 1)}%. Critical threshold reached.",
                "severity": "high",
                "time": datetime.now().strftime("%H:%M:%S")
            })
            
    except Exception as e:
        print(f"Alert Service Sync Error: {e}")
        # Could return a system error notification here if needed
        
    return notifs
