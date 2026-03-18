import { useEffect, useRef } from 'react'
import * as LWC from 'lightweight-charts'

import api from '../../services/api'

// Fetch initial historical data from Backend
async function fetchBackendHistory(symbol, tf = '1m') {
  try {
    const data = await api.market.getOHLCV(symbol, tf, 200)
    return data.candles
  } catch (err) {
    console.error("Backend History Error:", err)
    return []
  }
}

// Compute RSI (14)
function computeRSI(candles, period = 14) {
  if (candles.length < period) return []
  const closes = candles.map(c => c.close)
  const result = []
  for (let i = period; i < closes.length; i++) {
    let gains = 0, losses = 0
    for (let j = i - period; j < i; j++) {
      const diff = closes[j + 1] - closes[j]
      if (diff > 0) gains += diff
      else losses -= diff
    }
    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    result.push({ time: candles[i].time, value: parseFloat((100 - 100 / (1 + rs)).toFixed(2)) })
  }
  return result
}

// Compute MACD histogram
function computeMACD(candles) {
  if (candles.length < 34) return []
  const closes = candles.map(c => c.close)
  const ema = (data, p) => {
    const k = 2 / (p + 1)
    const out = [data[0]]
    for (let i = 1; i < data.length; i++) out.push(data[i] * k + out[i - 1] * (1 - k))
    return out
  }
  const ema12 = ema(closes, 12)
  const ema26 = ema(closes, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signal = ema(macdLine.slice(26), 9)
  return candles.slice(34).map((c, i) => ({
    time: c.time,
    value: parseFloat((macdLine[34 + i] - signal[i + 8]).toFixed(4)),
  }))
}

const chartOpts = (width, height) => ({
  width,
  height,
  layout: { background: { color: '#0a0600' }, textColor: '#7c5a40' },
  grid: { vertLines: { color: '#1c1000' }, horzLines: { color: '#1c1000' } },
  timeScale: { borderColor: '#1c1000', timeVisible: true, secondsVisible: false },
  rightPriceScale: { borderColor: '#1c1000' },
  crosshair: { mode: 1 },
  handleScroll: true,
  handleScale: true,
})

export default function TradingChart({ symbol = 'BTC', type = 'candlestick', showRSI = true, showMACD = true }) {
  const mainRef = useRef(null)
  const rsiRef = useRef(null)
  const macdRef = useRef(null)

  useEffect(() => {
    if (!mainRef.current) return
    const w = mainRef.current.clientWidth || 600

    // ── Main chart ──
    const mainChart = LWC.createChart(mainRef.current, chartOpts(w, 360))

    let cs, ls
    if (type === 'candlestick') {
      cs = mainChart.addSeries(LWC.CandlestickSeries, {
        upColor: '#22c55e', downColor: '#ef4444',
        borderUpColor: '#22c55e', borderDownColor: '#ef4444',
        wickUpColor: '#22c55e', wickDownColor: '#ef4444',
      })
    } else {
      ls = mainChart.addSeries(LWC.LineSeries, { color: '#f97316', lineWidth: 2 })
    }

    // Volume overlay
    const vs = mainChart.addSeries(LWC.HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    })
    mainChart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 }, borderColor: '#1c1000' })

    // ── RSI sub-chart ──
    let rsiChart = null, rsiS, ob, os
    if (showRSI && rsiRef.current) {
      rsiChart = LWC.createChart(rsiRef.current, chartOpts(w, 130))
      rsiS = rsiChart.addSeries(LWC.LineSeries, { color: '#a855f7', lineWidth: 1.5 })
      ob = rsiChart.addSeries(LWC.LineSeries, { color: '#ef4444', lineWidth: 1, lineStyle: 2 })
      os = rsiChart.addSeries(LWC.LineSeries, { color: '#22c55e', lineWidth: 1, lineStyle: 2 })
    }

    // ── MACD sub-chart ──
    let macdChart = null, ms
    if (showMACD && macdRef.current) {
      macdChart = LWC.createChart(macdRef.current, chartOpts(w, 130))
      ms = macdChart.addSeries(LWC.HistogramSeries, { color: '#3b82f6' })
    }

    // ── Sync timescales ──
    const all = [mainChart, rsiChart, macdChart].filter(Boolean)
    all.forEach(ch => {
      ch.timeScale().subscribeVisibleLogicalRangeChange(range => {
        if (!range) return
        all.forEach(other => { if (other !== ch) other.timeScale().setVisibleLogicalRange(range) })
      })
    })

    // ── Data loading & WebSocket ──
    let currentCandles = []
    let ws = null

    const updateSubCharts = () => {
      if (rsiS) {
        const rsiData = computeRSI(currentCandles)
        if (rsiData.length > 0) {
          rsiS.setData(rsiData)
          ob.setData(rsiData.map(d => ({ time: d.time, value: 70 })))
          os.setData(rsiData.map(d => ({ time: d.time, value: 30 })))
        }
      }
      if (ms) {
        const macdData = computeMACD(currentCandles).filter(d => isFinite(d.value) && !isNaN(d.value))
        if (macdData.length > 0) {
          ms.setData(macdData.map(d => ({ ...d, color: d.value >= 0 ? '#22c55e80' : '#ef444480' })))
        }
      }
    }

    fetchBackendHistory(symbol)
      .then(data => {
        if (!data || data.length === 0) return
        currentCandles = data

        if (type === 'candlestick') {
          cs.setData(currentCandles)
        } else {
          ls.setData(currentCandles.map(c => ({ time: c.time, value: c.close })))
        }
        vs.setData(currentCandles.map(c => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? '#22c55e30' : '#ef444430',
        })))

        mainChart.timeScale().fitContent()
        updateSubCharts()

        // connect WS
        ws = new WebSocket(`ws://localhost:8000/api/ws/${symbol}`)
        
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data)
          if (msg.type === 'tick') {
            const tickPrice = msg.price
            const timestamp = Math.floor(msg.timestamp / 1000)
            const lastCandle = currentCandles[currentCandles.length - 1]

            if (lastCandle && timestamp <= lastCandle.time) {
              lastCandle.close = tickPrice
              lastCandle.high = Math.max(lastCandle.high, tickPrice)
              lastCandle.low = Math.min(lastCandle.low, tickPrice)
              
              if (type === 'candlestick') {
                cs.update(lastCandle)
              } else {
                ls.update({ time: lastCandle.time, value: lastCandle.close })
              }
            } else {
              const newCandle = {
                time: timestamp,
                open: tickPrice,
                high: tickPrice,
                low: tickPrice,
                close: tickPrice,
                volume: 0
              }
              currentCandles.push(newCandle)
              if (type === 'candlestick') {
                cs.update(newCandle)
              } else {
                ls.update({ time: newCandle.time, value: newCandle.close })
              }
            }
            updateSubCharts()
          }
        }
      })
      .catch(console.error)

    // ── ResizeObserver ──
    const ro = new ResizeObserver(() => {
      const nw = mainRef.current?.clientWidth || w
      mainChart.applyOptions({ width: nw })
      rsiChart?.applyOptions({ width: nw })
      macdChart?.applyOptions({ width: nw })
    })
    ro.observe(mainRef.current)

    return () => {
      if (ws) ws.close()
      ro.disconnect()
      mainChart.remove()
      rsiChart?.remove()
      macdChart?.remove()
    }
  }, [symbol, type, showRSI, showMACD])

  return (
    <div className="w-full">
      <div ref={mainRef} className="w-full rounded-t-2xl overflow-hidden" style={{ minHeight: 360 }} />
      {showRSI && (
        <div className="relative w-full mt-0.5">
          <div className="absolute top-1.5 left-3 text-[9px] font-black text-purple-400 uppercase tracking-widest z-10 pointer-events-none">RSI (14)</div>
          <div ref={rsiRef} className="w-full overflow-hidden" style={{ minHeight: 130 }} />
        </div>
      )}
      {showMACD && (
        <div className="relative w-full mt-0.5">
          <div className="absolute top-1.5 left-3 text-[9px] font-black text-blue-400 uppercase tracking-widest z-10 pointer-events-none">MACD</div>
          <div ref={macdRef} className="w-full rounded-b-2xl overflow-hidden" style={{ minHeight: 130 }} />
        </div>
      )}
    </div>
  )
}
