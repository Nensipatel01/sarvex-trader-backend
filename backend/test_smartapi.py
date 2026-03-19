from smartapi import SmartConnect
import pyotp
import json

# --- FILL THESE IN TO TEST ---
API_KEY = "YOUR_API_KEY"
CLIENT_ID = "YOUR_CLIENT_ID"
PASSWORD = "YOUR_PASSWORD"
TOTP_SECRET = "YOUR_TOTP_SECRET" 
# -----------------------------

def debug_login():
    try:
        print(f"--- SmartAPI Connection Debug ---")
        print(f"1. Initializing SmartConnect with API Key...")
        obj = SmartConnect(api_key=API_KEY)
        
        print(f"2. Generating TOTP from secret...")
        totp_val = pyotp.TOTP(TOTP_SECRET).now()
        print(f"   Current TOTP: {totp_val}")
        
        print(f"3. Attempting session generation...")
        data = obj.generateSession(CLIENT_ID, PASSWORD, totp_val)
        
        print(f"--- RESPONSE ---")
        print(json.dumps(data, indent=2))
        
        if data.get('status'):
            print("\n✅ SUCCESS: Connection Established!")
            print(f"JWT Token: {data['data']['jwtToken'][:20]}...")
        else:
            print("\n❌ FAILED: Check the error message above.")
            
    except Exception as e:
        print(f"\n💥 CRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    debug_login()
