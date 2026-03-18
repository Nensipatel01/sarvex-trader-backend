from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import User, BrokerAccount
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/risk", tags=["Risk Management"])

class RiskConfiguration(BaseModel):
    max_daily_loss: float = 1000.0
    risk_per_trade_percent: float = 1.0
    max_drawdown_percent: float = 5.0
    auto_stop_trading: bool = True

class PositionSizeRequest(BaseModel):
    account_id: int
    entry_price: float
    stop_loss: float
    risk_amount: Optional[float] = None # If None, use risk_per_trade_percent

@router.get("/status")
def get_risk_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the current risk exposure, margin usage, and daily P&L status.
    """
    from app.models.models import BrokerAccount, Position
    
    # Get all broker accounts for the user
    broker_accounts = db.query(BrokerAccount).filter(BrokerAccount.user_id == current_user.id).all()
    total_equity = sum(acc.balance for acc in broker_accounts)
    
    # Get all open positions
    open_positions = db.query(Position).filter(
        Position.user_id == current_user.id,
        Position.status == "OPEN"
    ).all()
    
    total_exposure = sum(p.size * p.entry_price for p in open_positions)
    daily_pnl = sum(p.pnl for p in open_positions if p.pnl is not None)
    
    # Calculate margin usage (simplified: exposure / equity)
    margin_usage = (total_exposure / total_equity * 100) if total_equity > 0 else 0
    
    # Determine risk status
    status = "HEALTHY"
    if margin_usage > 40:
        status = "WARNING"
    if margin_usage > 70:
        status = "CRITICAL"

    # Aggregated heatmap (by symbol)
    heatmap = []
    symbol_exposures = {}
    for p in open_positions:
        symbol_exposures[p.symbol] = symbol_exposures.get(p.symbol, 0) + (p.size * p.entry_price)
    
    for symbol, exp in symbol_exposures.items():
        heatmap.append({
            "sector": symbol,
            "exposure": round((exp / total_exposure * 100), 1) if total_exposure > 0 else 0
        })

    return {
        "daily_pnl": round(daily_pnl, 2),
        "total_equity": round(total_equity, 2),
        "total_exposure": round(total_exposure, 2),
        "margin_usage": round(margin_usage, 1),
        "status": status,
        "open_positions": len(open_positions),
        "risk_heatmap": heatmap or [{"sector": "Stablecoins", "exposure": 100}]
    }

@router.post("/calculate-size")
def calculate_position_size(
    req: PositionSizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Calculates the ideal lot size based on account balance and risk parameters.
    Example: Balance $10k, Risk 1% ($100), SL 2% distance -> Size $5k.
    """
    account = db.query(BrokerAccount).filter(
        BrokerAccount.id == req.account_id,
        BrokerAccount.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    balance = account.balance
    risk_amount = req.risk_amount if req.risk_amount else (balance * 0.01) # Default 1%
    
    price_diff = abs(req.entry_price - req.stop_loss)
    if price_diff == 0:
        raise HTTPException(status_code=400, detail="Stop loss cannot be equal to entry price")
        
    # Lot Size = Risk Amount / Price Difference
    suggested_size = risk_amount / price_diff
    
    return {
        "account_balance": balance,
        "risk_amount": risk_amount,
        "suggested_size": suggested_size,
        "notional_value": suggested_size * req.entry_price,
        "leverage": (suggested_size * req.entry_price) / balance
    }
