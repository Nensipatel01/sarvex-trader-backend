from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.models.watchlist import Watchlist, WatchlistItem
from pydantic import BaseModel

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])

class WatchlistItemCreate(BaseModel):
    symbol: str
    name: str = None

class WatchlistCreate(BaseModel):
    name: str = "Default Watchlist"

class WatchlistItemSchema(BaseModel):
    id: int
    symbol: str
    name: str = None
    class Config:
        from_attributes = True

class WatchlistSchema(BaseModel):
    id: int
    name: str
    items: List[WatchlistItemSchema]
    class Config:
        from_attributes = True

@router.get("/", response_model=List[WatchlistSchema])
async def get_watchlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()

@router.post("/", response_model=WatchlistSchema)
async def create_watchlist(
    watchlist: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_watchlist = Watchlist(name=watchlist.name, user_id=current_user.id)
    db.add(db_watchlist)
    db.commit()
    db.refresh(db_watchlist)
    return db_watchlist

@router.post("/{watchlist_id}/items", response_model=WatchlistItemSchema)
async def add_watchlist_item(
    watchlist_id: int,
    item: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watchlist = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id, 
        Watchlist.user_id == current_user.id
    ).first()
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    db_item = WatchlistItem(
        symbol=item.symbol.upper(),
        name=item.name,
        watchlist_id=watchlist_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}")
async def remove_watchlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the item belongs to a watchlist owned by the current user
    item = db.query(WatchlistItem).join(Watchlist).filter(
        WatchlistItem.id == item_id,
        Watchlist.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Item removed"}
