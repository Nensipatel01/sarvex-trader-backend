from fastapi import APIRouter, Depends
from typing import Optional
import random
from app.api.deps import get_current_user
from app.models.models import User
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Position, BrokerAccount
from app.services.portfolio_service import PortfolioService
from pydantic import BaseModel

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/summary")
async def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PortfolioService(db)
    portfolio_data = service.get_unified_portfolio(current_user.id)
    total_balance = portfolio_data["total_balance"]
    
    # If no accounts, show a base mock value
    if total_balance == 0:
        total_balance = 124500.00
    
    daily_pnl = total_balance * 0.012  # Mock 1.2% profit
    daily_pnl_percent = 1.2
    
    # Generate dynamic equity curve based on total balance
    curve = []
    for i in range(7):
        val = total_balance - (total_balance * 0.02 * (6 - i)) + random.uniform(-1000, 1000)
        curve.append({"time": f"W{i+1}", "value": round(val, 2)})

    return {
        "total_balance": round(total_balance, 2),
        "daily_pnl": round(daily_pnl, 2),
        "daily_pnl_percent": daily_pnl_percent,
        "equity_curve": curve
    }

@router.get("/positions")
async def get_positions(
    broker_account_id: Optional[int] = None,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolio_data = service.get_unified_portfolio(current_user.id)
    positions = portfolio_data["positions"]
    
    if not positions and not broker_account_id:
        return [
            {"symbol": "BTC/USDT", "type": "LONG", "entry_price": 63800, "size": 0.5, "pnl": 450, "status": "Open"},
            {"symbol": "ETH/USDT", "type": "LONG", "entry_price": 3480, "size": 2.0, "pnl": -120, "status": "Open"}
        ]
    return positions

class PositionCreate(BaseModel):
    symbol: str
    entry_price: float
    size: float
    status: str = "Open"
    broker_account_id: Optional[int] = None

@router.post("/positions")
async def create_position(
    position: PositionCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_position = Position(
        symbol=position.symbol,
        entry_price=position.entry_price,
        size=position.size,
        status=position.status,
        user_id=current_user.id,
        broker_account_id=position.broker_account_id
    )
    db.add(db_position)
    db.commit()
    db.refresh(db_position)
    return db_position
