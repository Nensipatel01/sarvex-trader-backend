import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Square, Play, AlertTriangle, Shield, CheckCircle2,
  TrendingUp, TrendingDown, Clock, Activity, Bell, Lock, Unlock, RefreshCw
} from 'lucide-react'

// ── Simulated Auto-Trading Engine ───────────────────────────────────────────
const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'NVDA', 'AAPL']
const STRATEGIES = ['Mean Reversion v1.4', 'Trend Follow Pro', 'Breakout Hunter']

function generateTick(symbol) {
  const bases = { 'BTC/USDT': 65000, 'ETH/USDT': 3200, 'SOL/USDT': 175, 'NVDA': 880, 'AAPL': 185 }
  const base = bases[symbol] || 100
  return parseFloat((base * (1 + (Math.random() - 0.5) * 0.004)).toFixed(2))
}

function fmtTime() { return new Date().toLocaleTimeString() }

function randomOrder(symbol) {
  const side = Math.random() > 0.5 ? 'BUY' : 'SELL'
  const price = generateTick(symbol)
  const qty = parseFloat((Math.random() * 2 + 0.1).toFixed(3))
  const pnl = (Math.random() - 0.42) * 400
  return { side, price, qty, pnl: parseFloat(pnl.toFixed(2)), symbol, time: fmtTime(), status: 'FILLED' }
}

const RISK_RULES = [
  { id: 'max_loss', label: 'Daily Max Loss', value: '$500', active: true, color: 'text-red-500' },
  { id: 'position_limit', label: 'Max Position Size', value: '2% equity', active: true, color: 'text-yellow-500' },
  { id: 'drawdown', label: 'Max Drawdown Stop', value: '10%', active: true, color: 'text-orange-500' },
  { id: 'trade_freq', label: 'Max 20 Trades/Day', value: 'Frequency Cap', active: false, color: 'text-blue-500' },
]

export default function AutoTrading() {
  const [engineOn, setEngineOn] = useState(false)
  const [emergencyStop, setEmergencyStop] = useState(false)
  const [orders, setOrders] = useState([])
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ totalPnl: 0, trades: 0, wins: 0 })
  const [ticks, setTicks] = useState({})
  const [riskRules, setRiskRules] = useState(RISK_RULES)
  const [activeStrategy, setActiveStrategy] = useState(STRATEGIES[0])
  const [accounts, setAccounts] = useState([
    { id: 1, label: 'Main BTC Account', broker: 'Binance', balance: 12450, active: true },
    { id: 2, label: 'Equity Portfolio', broker: 'Upstox', balance: 45200, active: false },
    { id: 3, label: 'SOL DCA Account', broker: 'Bybit', balance: 8700, active: false },
  ])
  const logRef = useRef(null)
  const intervalRef = useRef(null)

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(p => [{ msg, type, ts: fmtTime() }, ...p.slice(0, 99)])
  }, [])

  const startEngine = () => {
    if (emergencyStop) return
    setEngineOn(true)
    addLog(`🚀 Auto-Trading Engine STARTED — Strategy: ${activeStrategy}`, 'success')
    addLog(`Scanning ${SYMBOLS.length} symbols for entry signals...`, 'info')
  }

  const stopEngine = () => {
    setEngineOn(false)
    addLog('⏹  Engine paused by operator.', 'warn')
  }

  const triggerEmergencyStop = () => {
    setEngineOn(false)
    setEmergencyStop(true)
    addLog('🛑 EMERGENCY STOP ACTIVATED — All positions halted!', 'error')
    addLog('All open orders cancelled. Manual review required.', 'error')
  }

  const resetEmergencyStop = () => {
    setEmergencyStop(false)
    addLog('✅ Emergency stop cleared by operator. Engine ready.', 'success')
  }

  // Tick simulation + order generation
  useEffect(() => {
    if (!engineOn) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      // Update ticks
      setTicks(prev => {
        const next = { ...prev }
        SYMBOLS.forEach(s => { next[s] = generateTick(s) })
        return next
      })
      // Occasionally generate a trade
      if (Math.random() > 0.6) {
        const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        const order = randomOrder(sym)
        setOrders(p => [order, ...p.slice(0, 49)])
        setStats(p => ({
          totalPnl: parseFloat((p.totalPnl + order.pnl).toFixed(2)),
          trades: p.trades + 1,
          wins: order.pnl > 0 ? p.wins + 1 : p.wins,
        }))
        addLog(`${order.side} ${order.qty} ${order.symbol} @ $${order.price} — PnL: ${order.pnl >= 0 ? '+' : ''}$${order.pnl}`, order.pnl >= 0 ? 'success' : 'warn')
      }
    }, 1500)
    return () => clearInterval(intervalRef.current)
  }, [engineOn, addLog])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [logs])

  const toggleAccount = (id) => setAccounts(p => p.map(a => a.id === id ? { ...a, active: !a.active } : a))
  const toggleRule = (id) => setRiskRules(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r))

  const winRate = stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-1">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="text-[var(--orange-primary)]" /> Algorithmic Trading Engine
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Automated strategy execution with real-time risk mitigation and institutional controls.</p>
        </div>
        <div className="flex items-center gap-2">
          {!emergencyStop ? (
            <>
              <button onClick={engineOn ? stopEngine : startEngine}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all shadow-lg ${engineOn ? 'bg-zinc-800 text-white hover:bg-red-500/10' : 'bg-[var(--orange-primary)] text-black hover:scale-105 shadow-orange-500/20'}`}>
                {engineOn ? <Square size={14} /> : <Play size={14} />}
                {engineOn ? 'Pause Strategy' : 'Start Execution'}
              </button>
              <button onClick={triggerEmergencyStop}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <AlertTriangle size={14} /> Kill-Switch
              </button>
            </>
          ) : (
            <button onClick={resetEmergencyStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white transition-all animate-pulse shadow-lg shadow-green-500/20">
              <RefreshCw size={14} /> Reset Kill-Switch
            </button>
          )}
        </div>
      </div>

      {/* Emergency Stop Banner */}
      <AnimatePresence>
        {emergencyStop && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="text-red-500 animate-pulse" size={20} />
            <div>
              <div className="text-red-500 font-bold text-sm">GLOBAL OPERATIONAL HALT</div>
              <div className="text-red-400/60 text-xs">All automated order flow has been suspended. Managed review required for system reinstatement.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engine Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'System State', value: emergencyStop ? 'HALTED' : engineOn ? 'ACTIVE' : 'STANDBY', color: emergencyStop ? '#ef4444' : engineOn ? '#22c55e' : '#71717a' },
          { label: 'Session P&L', value: `${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}`, color: stats.totalPnl >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Orders Filled', value: stats.trades, color: 'var(--orange-primary)' },
          { label: 'Accuracy', value: `${winRate}%`, color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="bg-[#121212] border border-white/5 rounded-2xl p-4 shadow-xl">
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <div className="text-lg font-bold flex items-center gap-2" style={{ color: s.color }}>
              {s.label === 'System State' && <div className={`w-2 h-2 rounded-full ${engineOn && !emergencyStop ? 'animate-pulse' : ''}`} style={{ background: s.color }} />}
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ── Left: Config ── */}
        <div className="space-y-4">
          {/* Strategy Selector */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 space-y-3 shadow-xl">
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Selected Strategy</p>
            {STRATEGIES.map(s => (
              <button key={s} onClick={() => { if (!engineOn) setActiveStrategy(s) }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${activeStrategy === s ? 'bg-[var(--orange-primary)]/10 border-[var(--orange-primary)]/30' : 'border-white/5 hover:border-white/10'} ${engineOn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className={`text-[11px] font-bold ${activeStrategy === s ? 'text-[var(--orange-primary)]' : 'text-zinc-400'}`}>{s}</span>
              </button>
            ))}
            {engineOn && <p className="text-[8px] text-zinc-600 italic text-center">Engine must be standby to change strategy</p>}
          </div>

          {/* Account Selection */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 space-y-2 shadow-xl">
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Target Accounts</p>
            {accounts.map(a => (
              <div key={a.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${a.active ? 'bg-green-500/5 border-green-500/10' : 'border-white/5'}`}>
                <div>
                  <div className="text-[10px] font-bold text-white">{a.label}</div>
                  <div className="text-[8px] text-zinc-500">{a.broker} · ${a.balance.toLocaleString()}</div>
                </div>
                <button onClick={() => toggleAccount(a.id)}
                  className={`w-9 h-5 rounded-full border transition-all relative ${a.active ? 'bg-green-500 border-green-400' : 'bg-zinc-800 border-zinc-700'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${a.active ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Risk Rules */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 space-y-2 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-[var(--orange-primary)]" size={14} />
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active Safety Protocols</p>
            </div>
            {riskRules.map(r => (
              <div key={r.id} className="flex items-center justify-between">
                <div>
                  <div className={`text-[10px] font-bold ${r.active ? 'text-white' : 'text-zinc-600'}`}>{r.label}</div>
                  <div className={`text-[8px] font-bold ${r.color}`}>{r.value}</div>
                </div>
                <button onClick={() => toggleRule(r.id)}
                  className={`w-9 h-5 rounded-full border transition-all relative ${r.active ? 'bg-[var(--orange-primary)] border-[var(--orange-primary)]' : 'bg-zinc-800 border-zinc-700'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${r.active ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Center: Live Ticks ── */}
        <div className="space-y-4">
          <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Activity className={engineOn ? 'text-green-500 animate-pulse' : 'text-zinc-600'} size={14} />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Real-Time Market Ticks</span>
            </div>
            <div className="divide-y divide-white/[0.02]">
              {SYMBOLS.map(sym => (
                <div key={sym} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-bold text-white">{sym}</span>
                  <motion.span key={ticks[sym]} initial={{ color: '#f97316' }} animate={{ color: '#ffffff' }} transition={{ duration: 1 }}
                    className="text-xs font-bold font-mono">
                    ${(ticks[sym] || generateTick(sym)).toLocaleString()}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Feed */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex-1">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-[var(--orange-primary)]" size={14} />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Execution Stream</span>
              </div>
              <span className="text-[8px] text-zinc-600 font-bold uppercase">{orders.length} ACTIVE</span>
            </div>
            <div className="divide-y divide-white/[0.02] max-h-[320px] overflow-y-auto">
              <AnimatePresence>
                {orders.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest italic">Awaiting Strategy Entry...</div>
                ) : orders.map((o, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${o.side === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{o.side}</span>
                      <div>
                        <div className="text-[10px] font-bold text-white">{o.symbol}</div>
                        <div className="text-[8px] text-zinc-500">{o.qty} @ ${o.price}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${o.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{o.pnl >= 0 ? '+' : ''}${o.pnl}</div>
                      <div className="text-[8px] text-zinc-600 font-bold">{o.time}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Right: Logs ── */}
        <div className="bg-[#050505] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <Clock className="text-zinc-600" size={14} />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Operational Audit Log</span>
            </div>
            <button onClick={() => setLogs([])} className="text-[8px] text-zinc-700 hover:text-white transition-colors font-bold uppercase tracking-widest">Purge</button>
          </div>
          <div ref={logRef} className="flex-1 p-3 overflow-y-auto font-mono space-y-1.5 max-h-[520px]">
            {logs.length === 0 ? (
              <p className="text-[9px] text-zinc-800 italic uppercase font-bold tracking-widest">System Standby...</p>
            ) : logs.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`text-[9px] leading-relaxed font-medium ${l.type === 'success' ? 'text-green-500' : l.type === 'error' ? 'text-red-500' : l.type === 'warn' ? 'text-yellow-500' : 'text-zinc-600'}`}>
                <span className="text-zinc-800">[{l.ts}]</span> {l.msg}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
