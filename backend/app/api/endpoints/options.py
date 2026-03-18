from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import math
import random
from datetime import datetime, timedelta
from app.api.deps import get_current_user
from app.models.models import User
from app.services.options_service import OptionsService
from pydantic import BaseModel

router = APIRouter(prefix="/options", tags=["Options"])

# ── BLACK-SCHOLES CORE ──
def norm_cdf(x):
    """Cumulative Distribution Function for Standard Normal Distribution."""
    return (1.0 + math.erf(x / math.sqrt(2.0))) / 2.0

def calculate_greeks(S, K, T, r, sigma, option_type="call"):
    """
    S: Spot Price
    K: Strike Price
    T: Time to expiry (in years)
    r: Risk-free rate
    sigma: Volatility (IV)
    """
    if T <= 0: return {"delta": 0, "gamma": 0, "theta": 0, "vega": 0, "rho": 0}
    
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    
    # Delta
    if option_type == "call":
        delta = norm_cdf(d1)
    else:
        delta = norm_cdf(d1) - 1
        
    # Gamma
    gamma = math.exp(-0.5 * d1**2) / (S * sigma * math.sqrt(2 * math.pi * T))
    
    # Vega
    vega = S * math.sqrt(T) * math.exp(-0.5 * d1**2) / math.sqrt(2 * math.pi) / 100
    
    # Theta
    term1 = -(S * sigma * math.exp(-0.5 * d1**2)) / (2 * math.sqrt(2 * math.pi * T))
    if option_type == "call":
        theta = (term1 - r * K * math.exp(-r * T) * norm_cdf(d2)) / 365
    else:
        theta = (term1 + r * K * math.exp(-r * T) * norm_cdf(-d2)) / 365
        
    return {
        "delta": round(float(delta), 3),
        "gamma": round(float(gamma), 4),
        "theta": round(float(theta), 2),
        "vega": round(float(vega), 3)
    }

# ── DATA MODELS ──
class OptionContract(BaseModel):
    strike: float
    type: str # call / put
    bid: float
    ask: float
    iv: float
    delta: float
    gamma: float
    theta: float
    vega: float
    volume: int
    oi: int

class OptionsChainResponse(BaseModel):
    symbol: str
    spot: float
    expiry: str
    chain: List[OptionContract]

class VolatilityPoint(BaseModel):
    strike: float
    iv: float
    expiry: str

class VolatilitySurfaceResponse(BaseModel):
    symbol: str
    surface: List[VolatilityPoint]

@router.get("/chain", response_model=OptionsChainResponse)
async def get_options_chain(symbol: str = "BTC", expiry: str = "", current_user: User = Depends(get_current_user)):
    """Generate a dynamic options chain around the current spot price."""
    # Mock spot prices (in real app, fetch from Market API)
    spots = {"BTC": 65420.50, "ETH": 3450.20, "SOL": 145.80}
    S = spots.get(symbol, 50000.0)
    
    iv_base = 0.45 if symbol == "BTC" else 0.55
    interval = 1000 if symbol == "BTC" else 100
    
    # Use OptionsService to generate the chain
    raw_chain = OptionsService.generate_chain(
        spot_price=S, 
        strikes_count=5, 
        step=interval, 
        expiry_days=30, 
        r=0.05, 
        sigma=iv_base
    )
    
    processed_chain = []
    for entry in raw_chain:
        K = entry["strike"]
        for opt_type in ["call", "put"]:
            greeks = entry[opt_type]
            processed_chain.append({
                "strike": float(K),
                "type": opt_type,
                "bid": round(greeks["price"] * 0.98, 2),
                "ask": round(greeks["price"] * 1.02, 2),
                "iv": iv_base,
                "delta": greeks["delta"],
                "gamma": greeks["gamma"],
                "theta": greeks["theta"],
                "vega": greeks["vega"],
                "volume": random.randint(100, 5000),
                "oi": random.randint(1000, 20000)
            })
            
    return {
        "symbol": symbol,
        "spot": S,
        "expiry": expiry or (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "chain": processed_chain
    }

@router.get("/summary")
async def get_options_summary(current_user: User = Depends(get_current_user)):
    """Global derivatives market summary."""
    return {
        "vix": round(float(random.uniform(15, 25)), 2),
        "btc_iv_rank": 42,
        "put_call_ratio": 0.85,
        "max_pain": 64000
    }

@router.get("/volatility-surface", response_model=VolatilitySurfaceResponse)
async def get_volatility_surface(symbol: str = "BTC", current_user: User = Depends(get_current_user)):
    """Generate a mock volatility surface (IV smile) across multiple expirations."""
    spots = {"BTC": 65420.50, "ETH": 3450.20, "SOL": 145.80}
    S = spots.get(symbol, 50000.0)
    
    iv_base = 0.45 if symbol == "BTC" else 0.55
    interval = 1000 if symbol == "BTC" else 100
    base_strike = round(S / interval) * interval
    
    # Generate strikes: -4 to +4 intervals around ATM
    strikes = [base_strike + (i * interval) for i in range(-4, 5)]
    
    # 3 mock expirations (short, medium, long term)
    expirations = [
        (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
        (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    ]
    
    surface_data = []
    
    for expiry_idx, expiry in enumerate(expirations):
        # Time effect: longer term options generally have lower base IV but flatter smile
        term_structure_multiplier = 1.0 - (expiry_idx * 0.05) 
        
        for strike in strikes:
            # Distance from ATM as a percentage
            moneyness = (strike - S) / S
            
            # Volatility Smile formula (parabolic: higher IV for OTM calls and puts)
            # Skew: Puts (negative moneyness) usually have slightly higher IV than Calls
            skew = -0.1 if moneyness < 0 else 0.05
            smile_effect = math.pow(moneyness * 10, 2) * 0.02
            
            calculated_iv = iv_base * term_structure_multiplier + smile_effect + skew
            
            surface_data.append({
                "strike": float(strike),
                "iv": round(float(calculated_iv * 100), 2), # Convert to percentage
                "expiry": expiry
            })
            
    return {
        "symbol": symbol,
        "surface": surface_data
    }
