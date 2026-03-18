from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import random
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User
from app.api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/journal", tags=["Trade Journal"])

# In-memory per-user journal (simple, no new DB table needed)
_journal_store: dict = {}

class JournalEntry(BaseModel):
    symbol: str
    date: str
    setup: str
    entry: float
    exit: float
    size: str
    outcome: str  # Win / Loss / Break-even
    mood: str
    lesson: str
    tags: Optional[List[str]] = []
    pnl: Optional[str] = ""

@router.get("/entries")
def get_entries(current_user: User = Depends(get_current_user)):
    return _journal_store.get(current_user.id, [])

@router.post("/entries")
def create_entry(entry: JournalEntry, current_user: User = Depends(get_current_user)):
    if current_user.id not in _journal_store:
        _journal_store[current_user.id] = []
    new_entry = {
        "id": int(datetime.utcnow().timestamp() * 1000),
        **entry.dict()
    }
    _journal_store[current_user.id].insert(0, new_entry)
    return new_entry

@router.delete("/entries/{entry_id}")
def delete_entry(entry_id: int, current_user: User = Depends(get_current_user)):
    entries = _journal_store.get(current_user.id, [])
    _journal_store[current_user.id] = [e for e in entries if e["id"] != entry_id]
    return {"message": "deleted"}
