from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Client, User
from app.api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/clients", tags=["Clients"])

class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: int
    created_at: datetime
    user_id: int
    broker_accounts: List[dict] = []

    class Config:
        from_attributes = True

@router.post("/", response_model=ClientOut)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_client = Client(
        **client_in.model_dump(),
        user_id=current_user.id
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

@router.get("/", response_model=List[ClientOut])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clients = db.query(Client).filter(Client.user_id == current_user.id).all()
    # Add simple summary of broker accounts
    for client in clients:
        client.broker_accounts = [
            {"id": b.id, "name": b.name, "type": b.type, "status": b.status, "balance": b.balance}
            for b in client.broker_accounts
        ]
    return clients

@router.get("/{client_id}", response_model=ClientOut)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.user_id == current_user.id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    client.broker_accounts = [
        {"id": b.id, "name": b.name, "type": b.type, "status": b.status, "balance": b.balance}
        for b in client.broker_accounts
    ]
    return client
@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(client)
    db.commit()
    return {"status": "success", "message": "Client deleted"}
