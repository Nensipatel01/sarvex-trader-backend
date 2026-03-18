import math
from scipy.stats import norm

class OptionsService:
    @staticmethod
    def black_scholes(S, K, T, r, sigma, option_type='call'):
        """
        S: Spot price
        K: Strike price
        T: Time to expiration (in years)
        r: Risk-free interest rate (decimal)
        sigma: Volatility (decimal)
        """
        if T <= 0:
            return max(0, S - K) if option_type == 'call' else max(0, K - S)

        d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
        d2 = d1 - sigma * math.sqrt(T)

        if option_type == 'call':
            price = S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
            delta = norm.cdf(d1)
        else:
            price = K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
            delta = norm.cdf(d1) - 1

        # Common Greeks
        gamma = norm.pdf(d1) / (S * sigma * math.sqrt(T))
        vega = S * norm.pdf(d1) * math.sqrt(T)
        theta = -(S * norm.pdf(d1) * sigma) / (2 * math.sqrt(T)) - r * K * math.exp(-r * T) * norm.cdf(d2 if option_type == 'call' else -d2)
        rho = K * T * math.exp(-r * T) * norm.cdf(d2 if option_type == 'call' else -d2)

        return {
            "price": round(price, 4),
            "delta": round(delta, 4),
            "gamma": round(gamma, 4),
            "theta": round(theta, 4),
            "vega": round(vega, 4),
            "rho": round(rho, 4)
        }

    @staticmethod
    def generate_chain(spot_price, strikes_count=5, step=100, expiry_days=30, r=0.05, sigma=0.2):
        """Generates a synthetic options chain around the spot price."""
        T = expiry_days / 365.0
        chain = []
        
        # Center strike
        base_strike = round(spot_price / step) * step
        
        for i in range(-strikes_count, strikes_count + 1):
            strike = base_strike + (i * step)
            call_greeks = OptionsService.black_scholes(spot_price, strike, T, r, sigma, 'call')
            put_greeks = OptionsService.black_scholes(spot_price, strike, T, r, sigma, 'put')
            
            chain.append({
                "strike": strike,
                "call": call_greeks,
                "put": put_greeks
            })
            
        return chain
