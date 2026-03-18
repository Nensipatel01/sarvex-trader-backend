from fastapi import APIRouter, Depends
import random
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/social", tags=["Social"])

@router.get("/signals")
async def get_signals(current_user: User = Depends(get_current_user)):
    return [
        { "user": "CryptoWhale", "time": "2m ago", "signal": "BUY BTC/USDT", "p": "$63,500", "t": "Swing", "color": "var(--green-profit)" },
        { "user": "ForexMaster", "time": "15m ago", "signal": "SELL EUR/USD", "p": "1.0921", "t": "Scalp", "color": "var(--red-loss)" },
        { "user": "StockNinja", "time": "1h ago", "signal": "BUY NVDA", "p": "$865.00", "t": "Intraday", "color": "var(--green-profit)" },
        { "user": "AlphaKing", "time": "3h ago", "signal": "BUY ETH/USDT", "p": "$3,420", "t": "Swing", "color": "var(--green-profit)" }
    ]

@router.get("/leaderboard")
async def get_leaderboard(current_user: User = Depends(get_current_user)):
    return [
        { "rank": 1, "name": "AlphaQuant_Capital", "return": "+142.5%", "followers": 1250, "risk": "High", "color": "text-orange-500" },
        { "rank": 2, "name": "Steady_Growth_Algo", "return": "+85.2%", "followers": 3400, "risk": "Low", "color": "text-gray-300" },
        { "rank": 3, "name": "Crypto_Whale_0x", "return": "+64.1%", "followers": 890, "risk": "Medium", "color": "text-orange-700" },
        { "rank": 4, "name": "SniperFX_Master", "return": "+52.8%", "followers": 450, "risk": "High", "color": "text-white" },
        { "rank": 5, "name": "SafeHaven_Yields", "return": "+21.4%", "followers": 5200, "risk": "Low", "color": "text-white" }
    ]

@router.get("/marketplace")
async def get_marketplace(current_user: User = Depends(get_current_user)):
    return [
        { "id": "1", "name": "BTC Reversal Sniper", "author": "AlphaQuant_Capital", "apy": "115%", "cost": "$50/mo", "description": "Mean reversion algorithm operating on 1H timeframe. Focuses on oversold/overbought extremes.", "winRate": "68%", "dd": "12%" },
        { "id": "2", "name": "ETH Yield Farmer", "author": "Steady_Growth_Algo", "apy": "45%", "cost": "Free", "description": "Delta neutral grid trading strategy capturing sideways volatility premium.", "winRate": "92%", "dd": "4%" },
        { "id": "3", "name": "NASDAQ Breakout Flow", "author": "SniperFX_Master", "apy": "78%", "cost": "$100/mo", "description": "Momentum breakout trading indexing NQ1! futures during high volume market opens.", "winRate": "54%", "dd": "18%" }
    ]
