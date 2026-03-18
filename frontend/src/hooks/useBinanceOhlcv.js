import { useState, useEffect, useRef } from 'react'

export function useBinanceOhlcv(symbol = 'BTCUSDT', interval = '1m') {
  const [data, setData] = useState([])
  const wsRef = useRef(null)
  
  // Format Binance string to match CCXT/Standard format
  const formattedSymbol = symbol.replace('/', '').toLowerCase()

  useEffect(() => {
    let isMounted = true

    const fetchHistoricalList = async () => {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${formattedSymbol.toUpperCase()}&interval=${interval}&limit=100`)
        const json = await res.json()
        
        if (!isMounted) return

        const formatted = json.map(d => ({
          time: d[0] / 1000, // Lightweight charts needs seconds
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4])
        }))
        
        setData(formatted)
      } catch (err) {
        console.error("Failed to fetch historical klines", err)
      }
    }

    fetchHistoricalList()

    // Initialize WebSocket for live updates
    const wsUrl = `wss://stream.binance.com/ws/${formattedSymbol}@kline_${interval}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      if (!isMounted) return
      
      const msg = JSON.parse(event.data)
      const kline = msg.k
      
      const candle = {
        time: kline.t / 1000,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c)
      }

      setData(prev => {
        if (prev.length === 0) return [candle]
        
        const lastCandle = prev[prev.length - 1]
        
        // If it's the same time period, update the last candle
        if (lastCandle.time === candle.time) {
          const newArr = [...prev]
          newArr[newArr.length - 1] = candle
          return newArr
        } 
        
        // Otherwise append the new candle
        return [...prev, candle]
      })
    }

    ws.onerror = (error) => {
      console.error("WebSocket error", error)
    }

    return () => {
      isMounted = false
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol, interval])

  return data
}
