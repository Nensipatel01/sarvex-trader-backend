import { useState, useEffect, useRef } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://web-production-ce70.up.railway.app/api/ws';

export const useMarketData = (symbol) => {
  const [data, setData] = useState({ price: 0, change: 0, timestamp: Date.now() });
  const [status, setStatus] = useState('connecting');
  const ws = useRef(null);

  useEffect(() => {
    if (!symbol) return;

    setStatus('connecting');
    ws.current = new WebSocket(`${WS_URL}/${symbol}`);

    ws.current.onopen = () => {
      setStatus('connected');
      console.log(`Connected to live stream: ${symbol}`);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'tick') {
          setData({
            price: message.price,
            change: message.change || 0,
            timestamp: message.timestamp,
            volume: message.v || 0
          });
        }
      } catch (err) {
        console.error('WS Message Parse Error:', err);
      }
    };

    ws.current.onclose = () => {
      setStatus('disconnected');
    };

    ws.current.onerror = (err) => {
      setStatus('error');
      console.error('WS Error:', err);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [symbol]);

  return { ...data, status };
};
