from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
import time

router = APIRouter(prefix="/ws", tags=["WebSocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, symbol: str):
        await websocket.accept()
        if symbol not in self.active_connections:
            self.active_connections[symbol] = []
        self.active_connections[symbol].append(websocket)

    def disconnect(self, websocket: WebSocket, symbol: str):
        if symbol in self.active_connections:
            self.active_connections[symbol].remove(websocket)

    async def broadcast(self, symbol: str, message: dict):
        if symbol in self.active_connections:
            for connection in self.active_connections[symbol]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    self.disconnect(connection, symbol)

manager = ConnectionManager()

# Background task to manage SmartStream
class StreamRelay:
    def __init__(self):
        self.sws = None
        self.active_symbols = set()

    def handle_tick(self, ticks):
        for tick in ticks:
            # Relay Angel One tick format to Sarvex frontend format
            symbol = tick.get('token') # This needs mapping back to name
            asyncio.create_task(manager.broadcast(symbol, {
                "type": "tick",
                "symbol": symbol,
                "price": tick.get('last_traded_price'),
                "timestamp": int(time.time() * 1000),
                "v": tick.get('volume_traded_today')
            }))

relay = StreamRelay()

async def tick_simulator(symbol: str):
    """Simulates ticks for a symbol if no real broker feed is active."""
    import random
    price = 100.0 # Base price
    while symbol in manager.active_connections and manager.active_connections[symbol]:
        if symbol in relay.active_symbols:
            # Real feed is active, stop simulator
            break
        change = random.uniform(-0.1, 0.1)
        price += change
        await manager.broadcast(symbol, {
            "type": "tick",
            "symbol": symbol,
            "price": round(price, 2),
            "timestamp": int(time.time() * 1000)
        })
        await asyncio.sleep(1)

@router.websocket("/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await manager.connect(websocket, symbol)
    
    # Check if we should start simulator or connect to real broker
    if len(manager.active_connections[symbol]) == 1:
        # For now, default to simulator, but allow switching to real feed
        # In a real scenario, we'd check if any user is logged into Angel One
        asyncio.create_task(tick_simulator(symbol))
        
    try:
        while True:
            # Handle incoming client messages (e.g. subscribe to different symbols)
            data = await websocket.receive_text()
            # logic for dynamic subscription could go here
    except WebSocketDisconnect:
        manager.disconnect(websocket, symbol)
