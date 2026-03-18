from fastapi import APIRouter, Depends
import random

from app.api.deps import get_current_user
from app.models.models import User
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "name": current_user.name or "Trader",
        "email": current_user.email,
        "tier": current_user.tier,
        "avatar": None,
        "joined": "March 2024",
        "broker_connected": True,
        "broker_name": "Binance"
    }

@router.get("/config")
async def get_config():
    return {
        "notifications": {
            "price_alerts": True,
            "order_fill": True,
            "news_summary": False
        },
        "risk": {
            "max_drawdown": 5,
            "daily_loss_limit": 2,
            "auto_sl": True
        }
    }
