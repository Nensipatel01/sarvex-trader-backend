from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base
from app.models.watchlist import Watchlist, WatchlistItem

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String)
    tier = Column(String, default="Standard")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    clients = relationship("Client", back_populates="admin")
    strategies = relationship("Strategy", back_populates="owner")
    broker_accounts = relationship("BrokerAccount", back_populates="admin")
    watchlists = relationship("Watchlist", back_populates="user")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, index=True)
    notes = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    admin = relationship("User", back_populates="clients")
    broker_accounts = relationship("BrokerAccount", back_populates="client")

class BrokerAccount(Base):
    __tablename__ = "broker_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String) # Crypto, Stocks, MT5, MT4
    api_key_enc = Column(String) # Encrypted
    api_secret_enc = Column(String) # Encrypted
    balance = Column(Float, default=0.0)
    status = Column(String, default="HEALTHY")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id")) # Admin owner
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True) # Optional client link

    admin = relationship("User", back_populates="broker_accounts")
    client = relationship("Client", back_populates="broker_accounts")
    positions = relationship("Position", back_populates="broker_account")
    strategies = relationship("Strategy", back_populates="broker_account")
    orders = relationship("Order", back_populates="broker_account")
    trades = relationship("Trade", back_populates="broker_account")

    # New Secure Fields
    broker_user_id = Column(String)
    enc_password = Column(String)
    enc_api_key = Column(String)
    enc_api_secret = Column(String)
    enc_totp_secret = Column(String)
    enc_access_token = Column(String)
    session_expiry = Column(DateTime)

class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    asset_class = Column(String, default="Crypto")
    timeframe = Column(String, default="1H")
    blocks = Column(JSON) # JSON structure of strategy blocks
    performance_summary = Column(JSON, nullable=True) # Last backtest results
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id"), nullable=True)

    owner = relationship("User", back_populates="strategies")
    broker_account = relationship("BrokerAccount", back_populates="strategies")

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    type = Column(String) # LONG/SHORT
    entry_price = Column(Float)
    size = Column(Float)
    status = Column(String, default="OPEN") # OPEN/CLOSED
    pnl = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id"), nullable=True)

    broker_account = relationship("BrokerAccount", back_populates="positions")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    broker_order_id = Column(String, index=True)
    symbol = Column(String, index=True)
    type = Column(String) # LIMIT, MARKET
    side = Column(String) # BUY, SELL
    price = Column(Float)
    avg_price = Column(Float, default=0.0)
    amount = Column(Float)
    filled = Column(Float, default=0.0)
    status = Column(String) # OPEN, CLOSED, CANCELLED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id"))
    broker_account = relationship("BrokerAccount", back_populates="orders")

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    broker_trade_id = Column(String, index=True)
    symbol = Column(String, index=True)
    side = Column(String)
    price = Column(Float)
    amount = Column(Float)
    fee = Column(Float, default=0.0)
    pnl = Column(Float, default=0.0)
    executed_at = Column(DateTime, default=datetime.utcnow)

    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id"))
    broker_account = relationship("BrokerAccount", back_populates="trades")
