from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import BrokerAccount, User, Client, Order, Trade, Position
from app.api.deps import get_current_user
from app.core.security import encrypt_value, decrypt_value
from app.services.broker_service import BrokerService
from pydantic import BaseModel
from datetime import datetime
from app.core.symbols import get_symbol_token
import random

router = APIRouter(prefix="/brokers", tags=["Brokers"])

class BrokerConnect(BaseModel):
    name: str
    type: str # Binance, MT5, Interactive Brokers
    client_id: Optional[int] = None
    broker_user_id: Optional[str] = None
    password: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    totp_secret: Optional[str] = None

class BrokerAccountOut(BaseModel):
    id: int
    name: str
    type: str
    broker_user_id: Optional[str]
    balance: float
    status: str
    client_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    symbol: str
    quantity: int
    side: str # BUY, SELL
    type: str # MARKET, LIMIT
    price: Optional[float] = None
    broker_id: int

@router.post("/connect", response_model=BrokerAccountOut)
def connect_broker(
    broker_in: BrokerConnect,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if broker_in.client_id:
        client = db.query(Client).filter(Client.id == broker_in.client_id, Client.user_id == current_user.id).first()
        if not client: raise HTTPException(status_code=404, detail="Client not found")

    new_account = BrokerAccount(
        name=broker_in.name,
        type=broker_in.type,
        client_id=broker_in.client_id,
        user_id=current_user.id,
        broker_user_id=broker_in.broker_user_id,
        enc_password=encrypt_value(broker_in.password),
        enc_api_key=encrypt_value(broker_in.api_key),
        enc_api_secret=encrypt_value(broker_in.api_secret),
        enc_totp_secret=encrypt_value(broker_in.totp_secret),
        status="CONNECTED",
        balance=random.uniform(1000, 50000) # Initial mock sync
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@router.post("/{broker_id}/sync")
def sync_broker_account(
    broker_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account.status = "SYNCING"
    db.commit()
    
    try:
        service = BrokerService(db)
        session_data = service.login(account)
        
        # Real balance update would happen here
        account.status = "CONNECTED"
        account.session_expiry = datetime.utcnow()
        db.commit()
        return {"status": "success", "message": "Account synced with Angel One", "balance": account.balance}
    except Exception as e:
        account.status = "ERROR"
        db.commit()
        return {"status": "error", "message": str(e)}
    
    return {"status": "success", "message": "Account sync initiated", "balance": account.balance}

@router.get("/", response_model=List[BrokerAccountOut])
def get_broker_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(BrokerAccount).filter(BrokerAccount.user_id == current_user.id).all()

@router.get("/{broker_id}", response_model=BrokerAccountOut)
def get_broker_account(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    broker = db.query(BrokerAccount).filter(BrokerAccount.id == broker_id, BrokerAccount.user_id == current_user.id).first()
    if not broker: raise HTTPException(status_code=404, detail="Broker account not found")
    return broker

@router.delete("/{broker_id}")
def delete_broker_account(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    broker = db.query(BrokerAccount).filter(BrokerAccount.id == broker_id, BrokerAccount.user_id == current_user.id).first()
    if not broker: raise HTTPException(status_code=404, detail="Broker account not found")
    
    db.delete(broker)
    db.commit()
    return {"status": "success", "message": "Broker account deleted"}

@router.post("/orders")
def place_broker_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(BrokerAccount).filter(BrokerAccount.id == order_in.broker_id, BrokerAccount.user_id == current_user.id).first()
    if not account: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Broker account not found")
    
    try:
        service = BrokerService(db)
        service.login(account)
        
        # Balance Validation (Mental Model Step 3)
        positions = service.get_positions()
        # For a real app, we'd check against account balance or available margin
        # For now, we ensure the account has some dummy equity or we check the API balance
        if account.balance < (order_in.quantity * (order_in.price or 100)):
             raise HTTPException(status_code=400, detail="Insufficient institutional balance")

        # Format params for SmartApi
        symbol_key = order_in.symbol.upper()
        token = get_symbol_token(symbol_key)
        
        params = {
            "variety": "NORMAL",
            "tradingsymbol": f"{symbol_key}-EQ",
            "symboltoken": token,
            "transactiontype": order_in.side.upper(),
            "exchange": "NSE",
            "ordertype": order_in.type.upper(),
            "producttype": "DELIVERY",
            "duration": "DAY",
            "price": order_in.price or 0,
            "quantity": order_in.quantity
        }
        
        response = service.place_order(params)
        return {"status": "success", "broker_response": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
