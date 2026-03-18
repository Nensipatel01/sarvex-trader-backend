import os
import random
from app.core.config import settings

# Trading-focused fallback responses when OpenAI key is not configured
FALLBACK_RESPONSES = [
    "RSI (Relative Strength Index) measures momentum. RSI below 30 = oversold (potential buy zone), RSI above 70 = overbought (potential sell zone). Best used with price action confirmation.",
    "For BTC/USDT currently, watch the 4H chart for EMA 50/200 crossovers. A golden cross (50 above 200) confirms bullish momentum while a death cross suggests a bearish reversal.",
    "Risk management rule: Never risk more than 1-2% of your capital on a single trade. If your account is $10,000, your max loss per trade should be $100-$200.",
    "MACD (Moving Average Convergence Divergence) is excellent for trend confirmation. When MACD line crosses above the signal line, it's a bullish signal. Below = bearish.",
    "Support and resistance levels are key. Once a resistance level is broken and price consolidates above it, it often becomes a new support level (flip zones).",
    "Bollinger Bands widen during high volatility and contract during low volatility. Price touching the lower band can indicate an oversold condition and potential bounce.",
    "For scalping strategies, use 1-minute and 5-minute charts with RSI and VWAP. Enter when RSI pulls back to 40-50 in an uptrend and price is above VWAP.",
    "Fibonacci retracement levels (23.6%, 38.2%, 61.8%) are strong areas to watch for reversals. The 61.8% level (golden ratio) is especially significant.",
    "Breakout trading: Wait for price to consolidate in a tight range, then enter when it breaks out with high volume. Place stop loss just inside the range.",
    "The trend is your friend! Before any trade, identify the higher timeframe trend on the daily chart, then use smaller timeframes to time your entry.",
]

class AIService:
    def __init__(self):
        self._has_openai_key = bool(getattr(settings, 'OPENAI_API_KEY', None))
        if self._has_openai_key:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception:
                self._has_openai_key = False
                self._client = None
        else:
            self._client = None

    async def get_market_analysis(self, query: str):
        # Try OpenAI first
        if self._has_openai_key and self._client:
            try:
                response = self._client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": (
                            "You are Sarvex AI, a professional trading assistant specialized in "
                            "crypto and forex markets. Provide concise, professional analysis "
                            "and strategy advice. Be direct and actionable."
                        )},
                        {"role": "user", "content": query}
                    ],
                    max_tokens=300
                )
                return response.choices[0].message.content
            except Exception as e:
                pass  # Fall through to fallback

        # Smart keyword-based fallback responses
        q = query.lower()
        if any(w in q for w in ['rsi', 'relative strength']):
            return "RSI (Relative Strength Index) measures momentum on a 0-100 scale. RSI < 30 = oversold (look for buy signals), RSI > 70 = overbought (consider selling). Best combined with price action — a bullish divergence (price lower low but RSI higher low) is a strong reversal signal."
        elif any(w in q for w in ['macd', 'moving average convergence']):
            return "MACD shows trend direction and momentum. When the MACD line crosses above the signal line (bullish crossover), it's a buy signal. Below = sell signal. The histogram bars show the distance between the lines — expanding bars = strengthening trend."
        elif any(w in q for w in ['bollinger', 'bands', 'bb']):
            return "Bollinger Bands (20 SMA ± 2 std deviations) show volatility. Price touching the lower band = oversold potential, upper band = overbought. A squeeze (bands contracting) often precedes a big move. Trade the breakout direction when bands expand."
        elif any(w in q for w in ['fibonacci', 'fib', 'retracement']):
            return "Key Fibonacci retracement levels: 23.6%, 38.2%, 50%, 61.8% (golden ratio), 78.6%. The 61.8% level is the most respected. In an uptrend, price often pulls back to the 38.2%-61.8% zone before continuing higher. Place buy limit orders at these levels."
        elif any(w in q for w in ['btc', 'bitcoin']):
            return "BTC/USDT analysis: Monitor the 4H and daily charts for key levels. Watch for support around round numbers (e.g., $60K, $65K, $70K). Volume spikes during breakouts confirm the move. On-chain metrics like whale accumulation and exchange flows also provide important context."
        elif any(w in q for w in ['risk', 'stop loss', 'position size']):
            return "Risk management fundamentals: (1) Risk 1-2% max per trade. (2) Set stop loss BEFORE entering. (3) Risk-Reward ratio should be at least 1:2. (4) Never average down on losing trades. Use the AI calculator in the Trade Hub to auto-size positions based on your account equity."
        elif any(w in q for w in ['trend', 'support', 'resistance']):
            return "Trend analysis: Always identify the higher timeframe trend first (daily chart). Use EMA 20, 50, 200 for dynamic support/resistance. In an uptrend: price above EMAs, each pullback to EMA 20 is a buy opportunity. Horizontal support/resistance from previous highs/lows are the most important levels."
        elif any(w in q for w in ['buy', 'sell', 'entry', 'signal']):
            return "For a quality entry: (1) Confirm higher-timeframe trend direction. (2) Look for price to pull back to key support or EMA. (3) Wait for a bullish candlestick pattern (engulfing, hammer, pin bar). (4) Confirm with RSI not overbought. (5) Enter with stop loss below the recent swing low."
        else:
            return random.choice(FALLBACK_RESPONSES)

ai_service = AIService()
