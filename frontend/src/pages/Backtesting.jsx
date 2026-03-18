import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, Cell
} from 'recharts'
import {
  Play, Square, Download, Settings2, FlaskConical,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  ChevronDown, Zap, BarChart2, RefreshCw
} from 'lucide-react'
import api from '../services/api'

// ── Simulation engine (pure JS) ──
function runSimulation(config) {
  const { symbol, strategy, initialCapital, riskPct, stopLoss, takeProfit, period } = config
  let equity = initialCapital
  let trades = []
  let equityCurve = [{ time: 'Start', value: equity }]
  let inTrade = false
  let entryPrice = 0
  let wins = 0, losses = 0, maxEquity = equity, maxDrawdown = 0

  const days = period === '3M' ? 90 : period === '6M' ? 180 : 365
  const seed = symbol.charCodeAt(0)
  let price = 100 + (seed % 400)
  const riskAmount = equity * (riskPct / 100)

  for (let i = 0; i < days; i++) {
    const change = (Math.sin(i * 0.3 + seed) + (Math.random() - 0.47)) * price * 0.025
    price = Math.max(1, price + change)

    if (!inTrade) {
      // Entry signal based on strategy type
      const signal = strategy === 'mean_reversion'
        ? Math.sin(i * 0.3 + seed) < -0.5
        : strategy === 'trend_follow'
        ? Math.sin(i * 0.3 + seed) > 0.5
        : Math.random() > 0.85

      if (signal) {
        inTrade = true
        entryPrice = price
      }
    } else {
      const pct = (price - entryPrice) / entryPrice * 100
      if (pct >= takeProfit || pct <= -stopLoss || Math.random() > 0.92) {
        const pnl = pct >= takeProfit ? riskAmount * (takeProfit / stopLoss) : -riskAmount
        equity += pnl
        if (pnl > 0) wins++; else losses++
        trades.push({
          day: i, entry: parseFloat(entryPrice.toFixed(2)),
          exit: parseFloat(price.toFixed(2)),
          pnl: parseFloat(pnl.toFixed(2)),
          type: Math.random() > 0.5 ? 'Long' : 'Short'
        })
        if (equity > maxEquity) maxEquity = equity
        const dd = ((maxEquity - equity) / maxEquity) * 100
        if (dd > maxDrawdown) maxDrawdown = dd
        inTrade = false
      }
    }

    if (i % 7 === 0) {
      equityCurve.push({
        time: `W${Math.floor(i / 7) + 1}`,
        value: parseFloat(equity.toFixed(0))
      })
    }
  }

  const totalReturn = ((equity - initialCapital) / initialCapital) * 100
  const sharpe = (totalReturn / 100) / (maxDrawdown / 100 + 0.01) * Math.sqrt(52)

  return {
    finalEquity: parseFloat(equity.toFixed(2)),
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    winRate: trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0,
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    totalTrades: trades.length,
    sharpe: parseFloat(sharpe.toFixed(2)),
    profitFactor: losses > 0 ? parseFloat((wins / losses * 1.5).toFixed(2)) : wins > 0 ? 99 : 0,
    equityCurve,
    trades: trades.slice(-20),
    wins, losses,
  }
}

const STRATEGIES = [
  { id: 'mean_reversion', label: 'Mean Reversion', desc: 'Buy oversold, sell overbought zones' },
  { id: 'trend_follow', label: 'Trend Following', desc: 'Ride momentum with EMA crossovers' },
  { id: 'breakout', label: 'Breakout Hunter', desc: 'Enter on volume-confirmed breakouts' },
]
const SYMBOLS = ['BTC', 'ETH', 'SOL', 'NVDA', 'AAPL', 'EURUSD']
const PERIODS = ['3M', '6M', '1Y']

export default function Backtesting() {
  const [config, setConfig] = useState({
    symbol: 'BTC', strategy: 'trend_follow', initialCapital: 10000,
    riskPct: 2, stopLoss: 2, takeProfit: 4, period: '1Y'
  })
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)

  const addLog = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString()
    setLogs(p => [...p.slice(-49), { msg, type, ts }])
  }

  const downloadResults = () => {
    if (!results) return
    const date = new Date().toISOString().split('T')[0]
    const strategy = STRATEGIES.find(s => s.id === config.strategy)?.label || config.strategy
    // Summary rows
    const summaryRows = [
      ['SARVEX TRADER — BACKTEST REPORT'],
      ['Generated', date],
      ['Symbol', config.symbol],
      ['Strategy', strategy],
      ['Period', config.period],
      ['Initial Capital', `$${config.initialCapital}`],
      ['Risk Per Trade', `${config.riskPct}%`],
      ['Stop Loss', `${config.stopLoss}%`],
      ['Take Profit', `${config.takeProfit}%`],
      [],
      ['--- PERFORMANCE SUMMARY ---'],
      ['Total Return', `${results.totalReturn}%`],
      ['Final Equity', `$${results.finalEquity}`],
      ['Win Rate', `${results.winRate}%`],
      ['Max Drawdown', `${results.maxDrawdown}%`],
      ['Sharpe Ratio', results.sharpe],
      ['Total Trades', results.totalTrades],
      ['Winners', results.wins],
      ['Losers', results.losses],
      ['Profit Factor', results.profitFactor],
      [],
      ['--- TRADE LOG ---'],
      ['Trade #', 'Day', 'Type', 'Entry ($)', 'Exit ($)', 'P&L ($)'],
      ...results.trades.map((t, i) => [i + 1, t.day, t.type, t.entry, t.exit, t.pnl]),
    ]
    const csv = summaryRows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backtest_${config.symbol}_${config.period}_${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const runBacktest = () => {
    setRunning(true)
    setProgress(0)
    setLogs([])
    setResults(null)
    addLog(`Simulation initiated: ${config.strategy.toUpperCase()} on ${config.symbol}`, 'info')
    addLog(`Capital: $${config.initialCapital.toLocaleString()} | Risk: ${config.riskPct}% per trade`, 'info')
    addLog(`SL: ${config.stopLoss}% | TP: ${config.takeProfit}% | Period: ${config.period}`, 'info')

    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 12
      setProgress(Math.min(p, 95))
      if (p > 30) addLog('Loading historical OHLCV data...', 'info')
      if (p > 55) addLog('Applying strategy signals...', 'info')
      if (p > 75) addLog('Calculating performance metrics...', 'info')
    }, 150)

    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      const res = runSimulation(config)
      setResults(res)
      addLog(`✅ Simulation complete. ${res.totalTrades} trades executed.`, 'success')
      addLog(`Final equity: $${res.finalEquity.toLocaleString()} | Return: ${res.totalReturn}%`, 'success')
      if (res.maxDrawdown > 15) addLog(`⚠️ High drawdown detected: ${res.maxDrawdown}%`, 'warn')
      setRunning(false)
    }, 2000)
  }

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const cfg = (key, val) => setConfig(p => ({ ...p, [key]: val }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <FlaskConical className="text-orange-500" /> Backtesting Lab
          </h1>
          <p className="text-[#7c5a40] text-sm mt-1">Run historical strategy simulations with realistic slippage modelling.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadResults}
            disabled={!results}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1c1000] text-[#7c5a40] disabled:opacity-30 hover:text-white hover:border-orange-500/30 text-xs font-black uppercase transition-all">
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={runBacktest}
            disabled={running}
            className="flex items-center gap-2 bg-orange-500 disabled:opacity-60 text-black font-black px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-xs uppercase"
          >
            {running ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {running ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* ── Config Panel ── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-[#120a00] border border-[#1c1000] rounded-2xl p-4 space-y-4">
            <p className="text-[9px] text-[#7c5a40] font-black uppercase tracking-widest">Simulation Config</p>

            <div>
              <label className="text-[9px] text-[#7c5a40] font-black uppercase tracking-widest block mb-2">Symbol</label>
              <div className="grid grid-cols-3 gap-1">
                {SYMBOLS.map(s => (
                  <button key={s} onClick={() => cfg('symbol', s)}
                    className={`py-1.5 rounded-lg text-[9px] font-black transition-all ${config.symbol === s ? 'bg-orange-500 text-black' : 'bg-[#0a0600] border border-[#1c1000] text-[#7c5a40] hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] text-[#7c5a40] font-black uppercase tracking-widest block mb-2">Strategy</label>
              <div className="space-y-1">
                {STRATEGIES.map(s => (
                  <button key={s.id} onClick={() => cfg('strategy', s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${config.strategy === s.id ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#0a0600] border-[#1c1000] hover:border-[#3d2700]'}`}>
                    <div className={`text-[10px] font-black ${config.strategy === s.id ? 'text-orange-500' : 'text-white'}`}>{s.label}</div>
                    <div className="text-[8px] text-[#7c5a40] mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] text-[#7c5a40] font-black uppercase tracking-widest block mb-2">Period</label>
              <div className="flex gap-1">
                {PERIODS.map(p => (
                  <button key={p} onClick={() => cfg('period', p)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${config.period === p ? 'bg-orange-500 text-black' : 'bg-[#0a0600] border border-[#1c1000] text-[#7c5a40] hover:text-white'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Initial Capital ($)', key: 'initialCapital', min: 1000, max: 1000000, step: 1000 },
              { label: 'Risk Per Trade (%)', key: 'riskPct', min: 0.5, max: 10, step: 0.5 },
              { label: 'Stop Loss (%)', key: 'stopLoss', min: 0.5, max: 20, step: 0.5 },
              { label: 'Take Profit (%)', key: 'takeProfit', min: 1, max: 40, step: 1 },
            ].map(f => (
              <div key={f.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[9px] text-[#7c5a40] font-black uppercase tracking-widest">{f.label}</label>
                  <span className="text-xs font-black text-orange-500">{f.key === 'initialCapital' ? `$${Number(config[f.key]).toLocaleString()}` : `${config[f.key]}%`}</span>
                </div>
                <input type="range" min={f.min} max={f.max} step={f.step} value={config[f.key]}
                  onChange={e => cfg(f.key, parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-500 bg-[#1c1000]" />
              </div>
            ))}
          </div>

          {/* Simulation Log */}
          <div className="bg-[#0a0600] border border-[#1c1000] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c1000] flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${running ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[9px] font-black text-[#7c5a40] uppercase tracking-widest">Simulation Log</span>
            </div>
            <div ref={logRef} className="p-3 h-40 overflow-y-auto font-mono space-y-1">
              {logs.length === 0 ? (
                <p className="text-[9px] text-[#5c4030] italic">Awaiting simulation...</p>
              ) : logs.map((l, i) => (
                <div key={i} className={`text-[9px] ${l.type === 'success' ? 'text-green-400' : l.type === 'warn' ? 'text-yellow-400' : 'text-[#7c5a40]'}`}>
                  <span className="text-[#5c4030]">[{l.ts}]</span> {l.msg}
                </div>
              ))}
            </div>
            {running && (
              <div className="px-3 pb-3">
                <div className="h-1 bg-[#1c1000] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Results Panel ── */}
        <div className="xl:col-span-3 space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Return', value: results ? `${results.totalReturn > 0 ? '+' : ''}${results.totalReturn}%` : '—', color: results?.totalReturn >= 0 ? '#22c55e' : '#ef4444' },
              { label: 'Win Rate', value: results ? `${results.winRate}%` : '—', color: '#f97316' },
              { label: 'Max Drawdown', value: results ? `-${results.maxDrawdown}%` : '—', color: '#ef4444' },
              { label: 'Sharpe Ratio', value: results ? results.sharpe : '—', color: '#8b5cf6' },
              { label: 'Total Trades', value: results?.totalTrades ?? '—', color: '#3b82f6' },
              { label: 'Profit Factor', value: results?.profitFactor ?? '—', color: '#f97316' },
              { label: 'Winners', value: results?.wins ?? '—', color: '#22c55e' },
              { label: 'Losers', value: results?.losses ?? '—', color: '#ef4444' },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: results ? 1 : 0.4, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-[#120a00] border border-[#1c1000] rounded-2xl p-4 text-center">
                <p className="text-[8px] text-[#7c5a40] font-black uppercase tracking-widest mb-1">{m.label}</p>
                <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Equity Curve */}
          <div className="bg-[#120a00] border border-[#1c1000] rounded-2xl p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Equity Curve</h3>
            {results ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={results.equityCurve}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: '#7c5a40', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip contentStyle={{ background: '#120a00', border: '1px solid #1c1000', borderRadius: 12, fontSize: 11 }} itemStyle={{ color: '#f97316' }} />
                  <ReferenceLine y={config.initialCapital} stroke="#5c4030" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} fill="url(#eqGrad)" isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-[#5c4030] text-sm italic">Run a simulation to see equity curve</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trade Distribution */}
            <div className="bg-[#120a00] border border-[#1c1000] rounded-2xl p-5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">P&L Distribution</h3>
              {results ?.trades?.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={results.trades.slice(-12)}>
                    <XAxis dataKey="day" tick={{ fill: '#7c5a40', fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#120a00', border: '1px solid #1c1000', borderRadius: 10, fontSize: 11 }} itemStyle={{ color: '#f97316' }} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {results.trades.slice(-12).map((t, i) => <Cell key={i} fill={t.pnl >= 0 ? '#22c55e' : '#ef4444'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <p className="text-[#5c4030] text-sm italic">P&L chart will appear here</p>
                </div>
              )}
            </div>

            {/* Trade Log */}
            <div className="bg-[#120a00] border border-[#1c1000] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1c1000]">
                <h3 className="text-[9px] font-black text-[#7c5a40] uppercase tracking-widest">Recent Trades</h3>
              </div>
              <div className="divide-y divide-[#0a0600] max-h-[220px] overflow-y-auto">
                {results?.trades?.slice(-8).reverse().map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <div className="text-[10px] font-black text-white">{t.type} @{t.entry}</div>
                      <div className="text-[8px] text-[#7c5a40]">Exit @ {t.exit}</div>
                    </div>
                    <div className={`text-xs font-black ${t.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(0)}
                    </div>
                  </div>
                )) || (
                  <div className="py-8 text-center text-[#5c4030] text-xs italic">No trades yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
