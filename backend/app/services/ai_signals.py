import os
from openai import OpenAI
from typing import List, Dict

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AISignalsService:
    @staticmethod
    def get_signal(symbol: str, ohlcv_data: List[Dict]) -> Dict:
        """Analyzes OHLCV data to generate a trading signal."""
        if not ohlcv_data:
            return {"symbol": symbol, "signal": "NEUTRAL", "reason": "No data available"}

        # Prepare context for AI
        recent_data = ohlcv_data[-20:] # Last 20 candles
        data_str = "\n".join([f"{d['time']}: O:{d['open']} H:{d['high']} L:{d['low']} C:{d['close']}" for d in recent_data])

        prompt = f"""
        Analyze the following candlestick data for {symbol} and provide a trading signal (BUY, SELL, or HOLD) with a brief technical reason.
        
        Data:
        {data_str}
        
        Output format: SIGNAL | REASON
        """

        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )
            content = response.choices[0].message.content
            signal_part, reason_part = content.split("|") if "|" in content else (content, "Market analysis complete.")
            
            return {
                "symbol": symbol,
                "signal": signal_part.strip().upper(),
                "reason": reason_part.strip()
            }
        except Exception as e:
            return {"symbol": symbol, "signal": "ERROR", "reason": str(e)}
