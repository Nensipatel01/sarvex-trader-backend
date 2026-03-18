import os
import sys
import threading
import uvicorn

# Ensure the 'backend' directory is in the path for module discovery
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from fastapi import FastAPI, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from app.db.session import engine, Base, SessionLocal, get_db
    from app.models.models import User
    from app.core import security
    from app.api.endpoints import (
        market, portfolio, auth, settings, risk, 
        execution, ai_intel, client, broker, 
        social, strategy, journal, alerts, options,
        watchlist, backtest, ws
    )
except ImportError as e:
    print(f"CRITICAL: Resource Import Failure: {e}")
    # Fallback to prevent startup crash if just linting
    pass

app = FastAPI(
    title="Sarvex Trader API",
    description="Institutional Backend for Sarvex Trader Control Terminal",
    version="1.2.0"
)

# Robust Database Initialization in Background
def init_db():
    print("Database initialization thread started...")
    try:
        from sqlalchemy import text
        Base.metadata.create_all(bind=engine)
        print("Database tables created/verified.")
        
        # Self-healing Migration: Add missing columns if they don't exist
        with engine.connect() as conn:
            # List of columns to check and add to broker_accounts
            # column_name: data_type
            new_columns = {
                "broker_user_id": "VARCHAR",
                "enc_password": "VARCHAR",
                "enc_api_key": "VARCHAR",
                "enc_api_secret": "VARCHAR",
                "enc_totp_secret": "VARCHAR",
                "enc_access_token": "VARCHAR",
                "session_expiry": "TIMESTAMP",
                "client_id": "INTEGER"
            }
            
            for col, dtype in new_columns.items():
                try:
                    # Check if column exists
                    # This syntax works for PostgreSQL (Railway) and SQLite
                    conn.execute(text(f"ALTER TABLE broker_accounts ADD COLUMN {col} {dtype}"))
                    conn.commit()
                    print(f"Migration: Added column {col} to broker_accounts")
                except Exception as e:
                    # Column likely already exists, ignore
                    pass

        # Seed test user if it doesn't exist
        db = SessionLocal()
        test_email = "test@example.com"
        user = db.query(User).filter(User.email == test_email).first()
        if not user:
            new_user = User(
                email=test_email,
                hashed_password=security.get_password_hash("Password123!"),
                name="Institutional Master",
                tier="Pro"
            )
            db.add(new_user)
            db.commit()
            print(f"Created seed user: {test_email}")
        db.close()
    except Exception as e:
        print(f"Background DB Initialization Error: {e}")

# Start DB init in background so we bind to PORT immediately
threading.Thread(target=init_db, daemon=True).start()

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-50t2zgddf-nensi-s-projects-3d9068d0.vercel.app",
    "https://frontend-39an9tmmx-nensi-s-projects-3d9068d0.vercel.app",
    "https://frontend-delta-seven-41.vercel.app",
    "https://sarvex-trader.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(market.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(execution.router, prefix="/api")
app.include_router(ai_intel.router, prefix="/api")
app.include_router(client.router, prefix="/api")
app.include_router(broker.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(strategy.router, prefix="/api")
app.include_router(journal.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(options.router, prefix="/api")
app.include_router(watchlist.router, prefix="/api")
app.include_router(backtest.router, prefix="/api")
app.include_router(ws.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "SARVEX TERMINAL LIVE - RAILWAY DEPLOY v1.3.0 [SYNC: 21:07]",
        "status": "synchronized",
        "version": "1.3.0",
        "build_id": "RAILWAY_PROD_1.3.0"
    }

@app.get("/health")
async def health():
    db_status = "unknown"
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "railway")
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
