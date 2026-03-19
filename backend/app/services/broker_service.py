import os
from datetime import datetime
from SmartApi import SmartConnect
import pyotp
from app.core.security import decrypt_value

class BrokerService:
    def __init__(self, db_session):
        self.db = db_session
        self.smart_api = None

    def login(self, account):
        """Authenticates with Angel One SmartAPI."""
        api_key = decrypt_value(account.enc_api_key)
        username = account.broker_user_id
        password = decrypt_value(account.enc_password)
        totp_secret = decrypt_value(account.enc_totp_secret)

        if not all([api_key, username, password, totp_secret]):
            raise ValueError("Incomplete broker credentials")

        self.smart_api = SmartConnect(api_key=api_key)
        totp_val = pyotp.TOTP(totp_secret).now()
        
        data = self.smart_api.generateSession(username, password, totp_val)
        
        if data.get('status'):
            # Store essential tokens on the account model if persistent session is needed
            # For now, we return them to the caller
            account.last_sync = datetime.utcnow()
            return data
        else:
            # Detailed error logging for debugging (Mental Model Step 4)
            error_msg = data.get('message', 'Unknown error')
            error_code = data.get('errorcode', 'N/A')
            print(f"❌ SmartAPI Login Failed | Client: {username} | Error: {error_msg} ({error_code})")
            raise Exception(f"SmartAPI Login failed: {error_msg} [{error_code}]")

    def get_ltp(self, exchange, symbol, token):
        """Get Last Traded Price from SmartAPI."""
        if not self.smart_api:
            raise Exception("Broker not authenticated")
        
        res = self.smart_api.ltpData(exchange, f"{symbol}-EQ", token)
        if res.get('status'):
            return res.get('data')
        return None

    def start_stream(self, client_code, feed_token, api_key, on_tick_callback):
        """
        Initializes real-time SmartStream for live market data.
        """
        from SmartApi.smartStreamWS import SmartStreamWS
        
        # This will be used by ws.py to relay data to clients
        sws = SmartStreamWS(feed_token, client_code)
        
        def on_tick(ws, ticks):
            if on_tick_callback:
                on_tick_callback(ticks)
        
        def on_connect(ws, response):
            print("SmartStream Connected")
        
        def on_error(ws, code, reason):
            print(f"SmartStream Error: {code} - {reason}")

        sws.on_tick = on_tick
        sws.on_connect = on_connect
        sws.on_error = on_error
        
        # Start in background
        return sws

    def place_order(self, params):
        """
        Places an order with Angel One.
        params: dict containing variety, tradingsymbol, symboltoken, transactiontype, 
                exchange, ordertype, producttype, duration, price, quantity
        """
        if not self.smart_api:
            raise Exception("Broker not authenticated")
        return self.smart_api.placeOrder(params)

    def get_positions(self):
        """Fetches active positions from the broker."""
        if not self.smart_api:
            return []
        res = self.smart_api.position()
        return res.get('data', []) if res.get('status') else []

    def get_holdings(self):
        """Fetches equity holdings from the broker."""
        if not self.smart_api:
            return []
        res = self.smart_api.holding()
        return res.get('data', []) if res.get('status') else []

    def get_rms_limit(self):
        """Fetches risk management system (RMS) limits / margin."""
        if not self.smart_api:
            return None
        res = self.smart_api.rmsLimit()
        return res.get('data', {}) if res.get('status') else {}

# Singleton-ish accessor or factory could be implemented here
