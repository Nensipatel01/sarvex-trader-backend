from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio

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

async def tick_simulator(symbol: str):
    """Simulates ticks for a symbol if no real broker feed is active."""
    import random
    import time
    price = 100.0 # Base price
    while symbol in manager.active_connections and manager.active_connections[symbol]:
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
    
    # Start a simulator for this symbol if it's the first connection
    if len(manager.active_connections[symbol]) == 1:
        asyncio.create_task(tick_simulator(symbol))
        
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, symbol)
