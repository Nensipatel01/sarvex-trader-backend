from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import User, BrokerAccount, Order
from app.api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/execution", tags=["Order Execution"])

class BracketOrderRequest(BaseModel):
    account_id: int
    symbol: str
    side: str # BUY, SELL
    type: str # MARKET, LIMIT
    quantity: float
    price: Optional[float] = None
    take_profit: float
    stop_loss: float

class OCOOrderRequest(BaseModel):
    account_id: int
    symbol: str
    quantity: float
    orders: List[dict] # List of order params

@router.post("/bracket")
def place_bracket_order(
    req: BracketOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Places a primary order with linked TP and SL.
    """
    account = db.query(BrokerAccount).filter(
        BrokerAccount.id == req.account_id,
        BrokerAccount.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    # Mock order creation logic
    main_order = Order(
        user_id=current_user.id,
        broker_account_id=req.account_id,
        symbol=req.symbol,
        side=req.side,
        type=req.type,
        quantity=req.quantity,
        price=req.price or 65000.0, # Mock price
        status="OPEN"
    )
    db.add(main_order)
    db.commit()
    db.refresh(main_order)
    
    return {
        "status": "SUCCESS",
        "order_id": main_order.id,
        "message": f"Bracket order placed for {req.symbol}",
        "links": [
            {"type": "TAKE_PROFIT", "price": req.take_profit},
            {"type": "STOP_LOSS", "price": req.stop_loss}
        ]
    }

@router.post("/trailing-stop")
def update_trailing_stop(
    order_id: int,
    callback_rate: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sets or updates a trailing stop for an active position.
    """
    return {"status": "SUCCESS", "message": f"Trailing stop set at {callback_rate}%"}

@router.get("/active-orders")
def get_active_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all linked and OCO orders currently active.
    """
    return {
        "bracket_orders": [],
        "oco_groups": [],
        "trailing_stops": []
    }
