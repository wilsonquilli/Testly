from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, ws: WebSocket, channel: str):
        await ws.accept()
        self.active.setdefault(channel, []).append(ws)

    def disconnect(self, ws: WebSocket, channel: str):
        if channel in self.active:
            self.active[channel] = [c for c in self.active[channel] if c != ws]
            if not self.active[channel]:
                del self.active[channel]

    async def broadcast(self, channel: str, data: dict):
        stale_connections = []

        for ws in self.active.get(channel, []):
            try:
                await ws.send_json(data)
            except Exception:
                stale_connections.append(ws)

        for ws in stale_connections:
            self.disconnect(ws, channel)

manager = ConnectionManager()