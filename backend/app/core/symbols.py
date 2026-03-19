# Symbol token mapping for Angel One (SmartAPI)
# In a production app, this would be a local database or a downloaded JSON from Angel One
# https://margincalculator.angelbroking.com/OpenAPI_File/103417/OpenAPIScripMaster.json

TOKEN_MAP = {
    "RELIANCE": "2885",
    "TCS": "11536",
    "INFY": "1594",
    "HDFCBANK": "1333",
    "ICICIBANK": "4963",
    "SBIN": "3045",
    "NIFTY": "99926000",
    "BANKNIFTY": "99926009"
}

def get_symbol_token(symbol):
    """Returns the Angel One token for a given symbol."""
    return TOKEN_MAP.get(symbol.upper(), "2885") # Default to Reliance for testing
