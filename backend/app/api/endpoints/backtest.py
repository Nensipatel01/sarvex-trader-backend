from fastapi import APIRouter, Depends
from typing import Dict, Any
import pandas as pd
import numpy as np
from app.api.deps import get_current_user
from app.models.models import User
from app.services.backtest_service import BacktestService

router = APIRouter(prefix="/backtest", tags=["Backtest"])

@router.post("/run")
async def run_backtest(params: Dict[str, Any], current_user: User = Depends(get_current_user)):
    symbol = params.get('symbol', 'BTC').upper()
    tf = params.get('timeframe', '1D')
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    
    df = pd.DataFrame()
    source = "synthetic"

    if api_key and api_key != "your_alpha_vantage_key_here":
        try:
            # Reusing the logic from market.py or making a direct call for historical
            # For 1D data
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={api_key}&outputsize=full"
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                data = response.json()
                ts_key = next((k for k in data.keys() if "Time Series" in k), None)
                if ts_key:
                    ts_data = data[ts_key]
                    records = []
                    for t, val in ts_data.items():
                        records.append({
                            "time": t,
                            "close": float(val["4. close"]),
                            "open": float(val["1. open"]),
                            "high": float(val["2. high"]),
                            "low": float(val["3. low"]),
                            "volume": int(val["5. volume"])
                        })
                    df = pd.DataFrame(records)
                    df['time'] = pd.to_datetime(df['time'])
                    df.set_index('time', inplace=True)
                    df.sort_index(inplace=True)
                    source = "Alpha Vantage"
        except Exception as e:
            print(f"Backtest Data Fetch Error: {e}")

    if df.empty:
        # Generate Synthetic Historical Data as fallback
        np.random.seed(42)
        periods = 120
        dates = pd.date_range(end=pd.Timestamp.now(), periods=periods, freq='D')
        returns = np.random.normal(0.001, 0.02, periods)
        price = 60000 * np.exp(np.cumsum(returns))
        df = pd.DataFrame({
            'close': price,
            'open': price * 0.99,
            'high': price * 1.01,
            'low': price * 0.98,
            'volume': np.random.randint(100, 1000, periods)
        }, index=dates)
    
    # Trim to last 120 periods if using full history
    if len(df) > 120:
        df = df.suffix(120) if hasattr(df, 'suffix') else df.iloc[-120:]

    results = BacktestService.run_backtest(df, params)
    return {
        "symbol": symbol,
        "timeframe": tf,
        "source": source,
        "metrics": {
            "total_return_pct": results["total_return_pct"],
            "win_rate": results["win_rate"],
            "max_drawdown_pct": results["max_drawdown_pct"],
            "sharpe_ratio": results["sharpe_ratio"]
        },
        "equity_curve": results["equity_curve"]
    }
