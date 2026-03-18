import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Plus, Trash2, CheckCircle2, AlertTriangle, Zap, TrendingUp, TrendingDown, X, Settings } from 'lucide-react'

const ALERT_TYPES = [
  { id: 'price_above', label: 'Price Above', icon: '🔺', color: 'text-green-500' },
  { id: 'price_below', label: 'Price Below', icon: '🔻', color: 'text-red-500' },
  { id: 'rsi_overbought', label: 'RSI Overbought (>70)', icon: '📊', color: 'text-yellow-500' },
  { id: 'rsi_oversold', label: 'RSI Oversold (<30)', icon: '📉', color: 'text-blue-500' },
  { id: 'macd_cross', label: 'MACD Cross', icon: '⚡', color: 'text-purple-500' },
  { id: 'pnl_loss', label: 'P&L Drawdown', icon: '🛑', color: 'text-red-500' },
]

const CHANNELS = ['In-App', 'Email', 'SMS', 'Webhook']

const SAMPLE_ALERTS = [
  { id: 1, symbol: 'BTC', type: 'price_above', value: '68000', channels: ['In-App', 'Email'], active: true, triggered: false },
  { id: 2, symbol: 'ETH', type: 'rsi_overbought', value: '70', channels: ['In-App'], active: true, triggered: true },
  { id: 3, symbol: 'NVDA', type: 'price_below', value: '840', channels: ['In-App', 'SMS'], active: false, triggered: false },
]

const SAMPLE_NOTIFICATIONS = [
  { id: 1, msg: 'ETH RSI crossed 70 — Overbought signal detected', time: '21:44:12', type: 'warn', read: false },
  { id: 2, msg: 'BTC broke $64,200 — Position +$1,240', time: '20:31:08', type: 'success', read: false },
  { id: 3, msg: 'SOL drawdown exceeds 5% — Risk alert', time: '19:58:44', type: 'error', read: true },
  { id: 4, msg: 'New strategy deployed: Trend Follow Pro on BTC account', time: '18:22:01', type: 'info', read: true },
  { id: 5, msg: 'Daily P&L target hit: +$1,740 ✅', time: '17:45:00', type: 'success', read: true },
]

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'NVDA', 'AAPL', 'EURUSD']

export default function Alerts() {
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ symbol: 'BTC', type: 'price_above', value: '', channels: ['In-App'] })
  const [activeTab, setActiveTab] = useState('alerts')

  const unreadCount = notifications.filter(n => !n.read).length

  const toggleChannel = (ch) => {
    setForm(p => ({
      ...p,
      channels: p.channels.includes(ch) ? p.channels.filter(c => c !== ch) : [...p.channels, ch]
    }))
  }

  const addAlert = (e) => {
    e.preventDefault()
    const t = ALERT_TYPES.find(a => a.id === form.type)
    setAlerts(p => [...p, { id: Date.now(), ...form, active: true, triggered: false }])
    setIsAdding(false)
    setForm({ symbol: 'BTC', type: 'price_above', value: '', channels: ['In-App'] })
  }

  const deleteAlert = (id) => setAlerts(p => p.filter(a => a.id !== id))
  const toggleAlert = (id) => setAlerts(p => p.map(a => a.id === id ? { ...a, active: !a.active } : a))
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })))
  const deleteNotif = (id) => setNotifications(p => p.filter(n => n.id !== id))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="text-[var(--orange-primary)]" /> Alerts & Notifications
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Configure price alerts, technical triggers, and monitor your institutional notification feed.</p>
        </div>
        <button onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[var(--orange-primary)] text-black font-bold px-4 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-orange-500/20 text-xs uppercase">
          <Plus size={14} /> Create Alert
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-6">
        {[
          { id: 'alerts', label: 'Monitor Rules', count: alerts.filter(a => a.active).length },
          { id: 'notifications', label: 'Activity Log', count: unreadCount },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'text-[var(--orange-primary)] border-[var(--orange-primary)]' : 'text-zinc-500 border-transparent'}`}>
            {tab.label}
            {tab.count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-[var(--orange-primary)] text-black text-[8px] font-bold">{tab.count}</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'alerts' ? (
          <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {alerts.length === 0 && (
              <div className="text-center py-16 text-zinc-500 italic text-sm">No active alerts. Click "Create Alert" to define your tracking rules.</div>
            )}
            {alerts.map((a, i) => {
              const t = ALERT_TYPES.find(x => x.id === a.type)
              return (
                <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-[#121212] border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${a.triggered ? 'border-[var(--orange-primary)]/40' : 'border-white/5'} ${!a.active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{t?.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{a.symbol}</span>
                        <span className={`text-[9px] font-bold ${t?.color}`}>{t?.label}</span>
                        {a.value && <span className="text-[var(--orange-primary)] font-bold text-xs">@ {a.value}</span>}
                        {a.triggered && <span className="text-[8px] font-bold bg-[var(--orange-primary)]/10 border border-[var(--orange-primary)]/30 text-[var(--orange-primary)] px-2 py-0.5 rounded-full animate-pulse">TRIGGERED</span>}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {a.channels.map(ch => <span key={ch} className="text-[7px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded">{ch}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleAlert(a.id)}
                      className={`w-10 h-5 rounded-full border transition-all relative ${a.active ? 'bg-[var(--orange-primary)] border-[var(--orange-primary)]' : 'bg-zinc-800 border-zinc-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${a.active ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                    <button onClick={() => deleteAlert(a.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div key="notifs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{unreadCount} UNREAD STATUSES</span>
              <button onClick={markAllRead} className="text-[9px] text-[var(--orange-primary)] font-bold hover:text-white transition-colors">MARK ALL AS REVIEWED</button>
            </div>
            {notifications.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${!n.read ? 'bg-[#121212] border-white/10' : 'bg-transparent border-white/5 opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : n.type === 'warn' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className={`text-xs font-medium ${n.read ? 'text-zinc-500' : 'text-zinc-200'}`}>{n.msg}</p>
                    <p className="text-[8px] text-zinc-600 mt-1 font-bold">{n.time}</p>
                  </div>
                </div>
                <button onClick={() => deleteNotif(n.id)} className="text-zinc-700 hover:text-zinc-300 transition-colors flex-shrink-0 mt-0.5"><X size={14} /></button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Alert Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-[#121212] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2"><Bell size={16} className="text-[var(--orange-primary)]" /> Define Alert Rule</h2>
                <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={addAlert} className="p-8 space-y-6">
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-3">Target Instrument</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SYMBOLS.map(s => (
                      <button type="button" key={s} onClick={() => setForm(p => ({ ...p, symbol: s }))}
                        className={`py-2 rounded-xl text-[9px] font-bold transition-all border ${form.symbol === s ? 'bg-[var(--orange-primary)] text-black border-[var(--orange-primary)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-3">Tracking Logic</label>
                  <div className="space-y-2">
                    {ALERT_TYPES.map(t => (
                      <button type="button" key={t.id} onClick={() => setForm(p => ({ ...p, type: t.id }))}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-3 ${form.type === t.id ? 'bg-[var(--orange-primary)]/10 border-[var(--orange-primary)]/40 text-[var(--orange-primary)]' : 'border-white/5 hover:border-white/10 text-zinc-500'}`}>
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {(form.type === 'price_above' || form.type === 'price_below' || form.type === 'pnl_loss') && (
                  <div>
                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-3">Trigger Threshold</label>
                    <input type="number" required value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                      placeholder="Enter value..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold placeholder:text-zinc-700" />
                  </div>
                )}
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block mb-3">Delivery Channels</label>
                  <div className="flex gap-2 flex-wrap">
                    {CHANNELS.map(ch => (
                      <button type="button" key={ch} onClick={() => toggleChannel(ch)}
                        className={`px-3 py-1.5 rounded-xl border text-[9px] font-bold transition-all ${form.channels.includes(ch) ? 'bg-[var(--orange-primary)]/10 border-[var(--orange-primary)]/30 text-[var(--orange-primary)]' : 'border-white/5 text-zinc-500 hover:text-white'}`}>{ch}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-bold text-zinc-500 hover:text-white transition-colors uppercase text-[10px] tracking-widest">Discard</button>
                  <button type="submit" className="flex-1 bg-[var(--orange-primary)] text-black font-bold py-4 rounded-xl hover:scale-105 transition-all uppercase text-[10px] tracking-widest">Deploy Alert</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
