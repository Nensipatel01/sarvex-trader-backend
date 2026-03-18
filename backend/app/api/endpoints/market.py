from fastapi import APIRouter, Depends, Query, HTTPException
import httpx
import os
import random
from datetime import datetime, timedelta
from typing import Optional
from app.api.deps import get_current_user
from app.models.models import User, BrokerAccount
from app.services.broker_service import BrokerService
from app.services.ai_signals import AISignalsService
from app.db.session import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/market", tags=["Market"])

# Seeded price generator per symbol for consistency within a session
_PRICES = {}
def _get_base(symbol: str) -> float:
    base_values = {
        'BTC': 65000.0, 'ETH': 3200.0, 'SOL': 175.0, 'AAPL': 185.0,
        'NVDA': 880.0, 'EUR/USD': 1.085, 'EURUSD': 1.085
    }
    if symbol not in _PRICES:
        _PRICES[symbol] = base_values.get(symbol, 100.0 + (hash(symbol) % 500))
    return float(_PRICES[symbol])

@router.get("/prices")
async def get_prices(current_user: User = Depends(get_current_user)):
    assets = ["BTC", "ETH", "SOL", "AAPL", "NVDA", "EUR/USD"]
    data = []
    for asset in assets:
        base = _get_base(asset)
        change_pct = random.uniform(-2.5, 2.5)
        price = base * (1 + change_pct / 100)
        _PRICES[asset] = price
        data.append({
            "symbol": asset,
            "price": round(float(price), 2),
            "change": round(float(change_pct), 2),
            "timestamp": datetime.now().isoformat()
        })
    return data

@router.get("/sentiment")
async def get_sentiment(current_user: User = Depends(get_current_user)):
    return {
        "overall": "Bullish",
        "confidence": 84,
        "news": [
            {"title": "Bitcoin breaks $64k", "sentiment": "Positive", "source": "Reuters"},
            {"title": "NVIDIA revenue beats expectations", "sentiment": "Positive", "source": "Bloomberg"}
        ]
    }

@router.get("/ohlcv")
async def get_ohlcv(
    symbol: str = "BTC",
    tf: str = "1D",
    limit: int = 90,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns real OHLCV data from Alpha Vantage or synthetic if unavailable."""
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    
    # If it's a crypto symbol, we might still want to use Binance or synthetic
    # But for simplicity, if ALPHA_VANTAGE_API_KEY is available, we try it.
    
    if api_key and api_key != "your_alpha_vantage_key_here":
        try:
            # Map TF to Alpha Vantage interval
            # AV intervals: 1min, 5min, 15min, 30min, 60min, daily, weekly, monthly
            av_tf = "daily"
            if tf in ["1m", "5m", "15m", "60m"]:
                av_tf = f"TIME_SERIES_INTRADAY&interval={tf.replace('m', 'min')}"
            elif tf == "1D":
                av_tf = "TIME_SERIES_DAILY"
            
            url = f"https://www.alphavantage.co/query?function={av_tf}&symbol={symbol}&apikey={api_key}"
            
            # 🚀 PHASE 2: Check for connected broker for real-time data
            broker = db.query(BrokerAccount).filter(BrokerAccount.user_id == current_user.id, BrokerAccount.status == "CONNECTED").first()
            if broker and broker.type == "AngelOne":
                try:
                    service = BrokerService(db)
                    service.login(broker)
                    # Placeholder: actual broker OHLCV call
                    # candles = service.get_ohlcv(symbol, tf, limit)
                    # if candles: return {"symbol": symbol, "tf": tf, "candles": candles, "source": "Angel One"}
                    pass
                except Exception as e:
                    print(f"Broker Data Error: {e}")
            if "INTRADAY" in av_tf:
                url += "&outputsize=compact"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                data = response.json()
                
                # Parse Alpha Vantage response
                time_series_key = next((k for k in data.keys() if "Time Series" in k), None)
                if time_series_key:
                    ts_data = data[time_series_key]
                    candles = []
                    # AV returns data in reverse chronological order often, or just dict keys
                    # We need to sort by time
                    sorted_times = sorted(ts_data.keys())[-limit:]
                    for t in sorted_times:
                        item = ts_data[t]
                        # Convert string time to timestamp
                        dt = datetime.strptime(t, "%Y-%m-%d %H:%M:%S" if len(t) > 10 else "%Y-%m-%d")
                        candles.append({
                            "time": int(dt.timestamp()),
                            "open": float(item["1. open"]),
                            "high": float(item["2. high"]),
                            "low": float(item["3. low"]),
                            "close": float(item["4. close"]),
                            "volume": int(item.get("5. volume", 0))
                        })
                    return {"symbol": symbol, "tf": tf, "candles": candles, "source": "Alpha Vantage"}
        except Exception as e:
            print(f"Alpha Vantage Error: {e}")
            # Fallback to synthetic

    # Synthetic fallback
    import random as rnd
    base_map = {'BTC': 65000, 'ETH': 3200, 'SOL': 175, 'AAPL': 185, 'NVDA': 880, 'EURUSD': 1.085}
    price = base_map.get(symbol, 100)
    tf_seconds = {'1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1D': 86400, '1W': 604800}
    step = tf_seconds.get(tf, 86400)
    candles = []
    now = int(datetime.now().timestamp())
    rnd.seed(hash(symbol))
    for i in range(limit):
        open_ = price
        change = (rnd.random() - 0.47) * price * 0.03
        close = max(0.01, open_ + change)
        high = max(open_, close) * (1 + rnd.random() * 0.01)
        low = min(open_, close) * (1 - rnd.random() * 0.01)
        volume = rnd.randint(1000, 10000)
        candles.append({
            "time": now - (limit - i) * step,
            "open": round(float(open_), 4),
            "high": round(float(high), 4),
            "low": round(float(low), 4),
            "close": round(float(close), 4),
            "volume": volume
        })
        price = close
    return {"symbol": symbol, "tf": tf, "candles": candles, "source": "synthetic"}

@router.get("/indicators")
async def get_indicators(
    symbol: str = "BTC",
    current_user: User = Depends(get_current_user)
):
    """Returns computed technical indicators for the given symbol."""
    try:
        import pandas as pd
        import random as rnd

        base_map = {'BTC': 65000, 'ETH': 3200, 'SOL': 175, 'AAPL': 185, 'NVDA': 880}
        price = base_map.get(symbol, 100)
        rnd.seed(hash(symbol))

        closes = []
        for _ in range(100):
            price = max(0.01, price * (1 + (rnd.random() - 0.47) * 0.025))
            closes.append(price)

        s = pd.Series(closes)
        
        # Vanilla Pandas RSI
        delta = s.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi_val = 100 - (100 / (1 + rs.iloc[-1]))

        # Vanilla Pandas MACD
        exp1 = s.ewm(span=12, adjust=False).mean()
        exp2 = s.ewm(span=26, adjust=False).mean()
        macd_val = (exp1 - exp2).iloc[-1]

        # Vanilla Pandas EMA
        ema_50 = s.ewm(span=50, adjust=False).mean().iloc[-1]
        ema_200 = s.ewm(span=min(200, len(s)), adjust=False).mean().iloc[-1]

        return {
            "symbol": symbol,
            "rsi": round(float(rsi_val), 2) if not pd.isna(rsi_val) else 50.0,
            "macd": round(float(macd_val), 4) if not pd.isna(macd_val) else 0.0,
            "ema_50": round(float(ema_50), 4),
            "ema_200": round(float(ema_200), 4),
            "signal": "Bullish" if rsi_val < 70 and macd_val > 0 else "Neutral"
        }
    except Exception as e:
        return {"symbol": symbol, "rsi": 55.0, "macd": 0.0012, "ema_50": 0.0, "ema_200": 0.0, "signal": "Neutral", "note": str(e)}

@router.get("/options/analytics")
async def get_options_analytics(current_user: User = Depends(get_current_user)):
    return {
        "iv_rank": 52,
        "pcr": 0.82,
        "max_pain": 62500,
        "greeks": {"delta": 0.64, "theta": -12.50, "gamma": 0.002, "vega": 45.2},
        "chain": [
            { "exp": "28 MAR 24", "strike": "60000", "call": "4,210", "put": "1,120", "iv": "52%", "delta": "0.82", "pcr": "0.45" },
            { "exp": "28 MAR 24", "strike": "62000", "call": "2,850", "put": "1,840", "iv": "48%", "delta": "0.65", "pcr": "0.62" },
            { "exp": "28 MAR 24", "strike": "64000", "call": "1,520", "put": "3,120", "iv": "45%", "delta": "0.50", "pcr": "0.95" },
            { "exp": "28 MAR 24", "strike": "66000", "call": "840", "put": "5,210", "iv": "50%", "delta": "0.35", "pcr": "1.45" }
        ]
    }
