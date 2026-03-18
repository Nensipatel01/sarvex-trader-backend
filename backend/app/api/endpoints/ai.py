from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.ai_service import ai_service
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
async def chat_with_ai(request: ChatRequest, current_user: User = Depends(get_current_user)):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    response = await ai_service.get_market_analysis(request.query)
    return {"response": response, "id": "sarvex-ai-msg-" + str(hash(response))[:8]}

@router.get("/insights")
async def get_insights(current_user: User = Depends(get_current_user)):
    return [
        {
            "type": "Chart Pattern",
            "title": "Double Bottom",
            "asset": "BTC/USDT",
            "confidence": 82,
            "description": "AI detected a classic reversal pattern. Support at $61,200 remains strong. Expect breakout above $64,800."
        },
        {
            "type": "Trend Alert",
            "title": "EMA Cross",
            "asset": "AAPL",
            "confidence": 75,
            "description": "50/200 Day EMA cross approaching on daily timeframe."
        }
    ]
