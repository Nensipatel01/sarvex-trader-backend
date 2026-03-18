import pandas as pd
import numpy as np

class BacktestService:
    @staticmethod
    def run_backtest(df, strategy_params):
        """
        df: DataFrame with OHLCV data
        strategy_params: dict with strategy logic (e.g., SMA crossover)
        """
        if df.empty:
            return {"error": "No data available for backtesting"}

        # Example: SMA Crossover Strategy
        sma_fast_period = strategy_params.get('sma_fast', 10)
        sma_slow_period = strategy_params.get('sma_slow', 50)
        
        df['sma_fast'] = df['close'].rolling(window=sma_fast_period).mean()
        df['sma_slow'] = df['close'].rolling(window=sma_slow_period).mean()
        
        # Signal Generation
        df['signal'] = 0
        df.loc[df['sma_fast'] > df['sma_slow'], 'signal'] = 1  # Buy
        df.loc[df['sma_fast'] < df['sma_slow'], 'signal'] = -1 # Sell
        
        # Calculate Returns
        df['market_returns'] = df['close'].pct_change()
        df['strategy_returns'] = df['market_returns'] * df['signal'].shift(1)
        
        # Cumulative Returns
        df['cum_market_returns'] = (1 + df['market_returns']).cumprod()
        df['cum_strategy_returns'] = (1 + df['strategy_returns']).cumprod()
        
        # Metrics
        total_return = (df['cum_strategy_returns'].iloc[-1] - 1) * 100
        win_rate = (df['strategy_returns'] > 0).sum() / (df['strategy_returns'] != 0).sum()
        
        # Max Drawdown
        rolling_max = df['cum_strategy_returns'].cummax()
        drawdown = df['cum_strategy_returns'] / rolling_max - 1
        max_drawdown = drawdown.min() * 100
        
        # Sharpe Ratio (Simplified)
        sharpe = (df['strategy_returns'].mean() / df['strategy_returns'].std()) * np.sqrt(252) if df['strategy_returns'].std() != 0 else 0

        # Equity Curve for chart
        equity_curve = []
        for i, row in df.iterrows():
            if not np.isnan(row['cum_strategy_returns']):
                equity_curve.append({
                    "time": str(i), 
                    "value": round(float(row['cum_strategy_returns']), 4)
                })

        return {
            "total_return_pct": round(float(total_return), 2),
            "win_rate": round(float(win_rate * 100), 2),
            "max_drawdown_pct": round(float(max_drawdown), 2),
            "sharpe_ratio": round(float(sharpe), 2),
            "equity_curve": equity_curve
        }
