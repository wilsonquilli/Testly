import { useEffect, useRef, useCallback, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ??
  API_BASE.replace(/^http:\/\//, "ws://").replace(/^https:\/\//, "wss://");

export function useWebSocket(path, options = {}) {
  const ws = useRef(null);
  const onMessageRef = useRef(options.onMessage);
  const [lastMessage, setLastMessage] = useState(null);
  const [status, setStatus] = useState(() => (path ? "connecting" : "idle"));

  useEffect(() => {
    onMessageRef.current = options.onMessage;
  }, [options.onMessage]);

  useEffect(() => {
    if (!path) return;

    const socket = new WebSocket(`${WS_BASE}${path}`);
    ws.current = socket;

    socket.onopen = () => setStatus("open");
    socket.onclose = () => setStatus("closed");
    socket.onerror = () => setStatus("closed");
    socket.onmessage = (e) => {
      let nextMessage = e.data;

      try {
        nextMessage = JSON.parse(e.data);
      } catch {}

      setLastMessage(nextMessage);
      onMessageRef.current?.(nextMessage);
    };

    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) socket.send("ping");
    }, 25_000);

    return () => {
      clearInterval(ping);
      socket.close();
    };
  }, [path]);

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN)
      ws.current.send(JSON.stringify(data));
  }, []);

  return { lastMessage, status: path ? status : "idle", send };
}