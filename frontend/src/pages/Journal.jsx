import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Plus, Trash2, Edit3, TrendingUp, TrendingDown, 
  Minus, Save, X, Calendar, Activity, Zap, ClipboardList,
  Target, Info, ChevronRight, Hash
} from 'lucide-react'
import api from '../services/api'
import { ErrorBoundary } from 'react-error-boundary'

const MOODS = [
  { label: 'Confident', emoji: '😎', color: 'var(--green-profit)' },
  { label: 'Neutral', emoji: '😐', color: 'var(--text-muted)' },
  { label: 'Anxious', emoji: '😟', color: 'var(--orange-primary)' },
  { label: 'FOMO', emoji: '😱', color: 'var(--red-loss)' },
  { label: 'Disciplined', emoji: '🧘', color: 'var(--green-profit)' },
]

const OUTCOMES = [
  { label: 'Win', icon: TrendingUp, color: 'text-[var(--green-profit)] bg-[var(--green-profit)]/10 border-[var(--green-profit)]/20' },
  { label: 'Loss', icon: TrendingDown, color: 'text-[var(--red-loss)] bg-[var(--red-loss)]/10 border-[var(--red-loss)]/20' },
  { label: 'Break-even', icon: Minus, color: 'text-white/40 bg-white/5 border-white/10' },
]

const SAMPLE_ENTRIES = [
  {
    id: 1,
    date: '2026-03-10',
    symbol: 'BTC/USDT',
    setup: 'Institutional Liquidity Grab at 64k. RSI Divergence confirmed on 4H terminal. Volume spike validation.',
    entry: 64200, exit: 67100, size: '1.20 BTC',
    outcome: 'Win', pnl: '+$3,480',
    mood: 'Disciplined',
    lesson: 'Waited for the second retest of the liquidity wick. Patience remains the highest-paying skill.',
    tags: ['LIQUIDITY', 'RSI', 'HFT_SYNC'],
  },
  {
    id: 2,
    date: '2026-03-08',
    symbol: 'ETH/USDT',
    setup: 'Breakout from macro consolidation. EMA correlation with 200-day support.',
    entry: 3850, exit: 3720, size: '12.5 ETH',
    outcome: 'Loss', pnl: '-$1,625',
    mood: 'Anxious',
    lesson: 'Entry scale was too aggressive for the volatility regime. Need to reduce size on macro breaks.',
    tags: ['BREAKOUT', 'EMA_CROSS'],
  },
]

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({
    symbol: '', setup: '', entry: '', exit: '', size: '',
    outcome: 'Win', mood: 'Disciplined', lesson: '', tags: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => { loadEntries() }, [])

  const loadEntries = async () => {
    try {
      const data = await api.journal.getEntries()
      setEntries(data.length > 0 ? data : SAMPLE_ENTRIES)
    } catch (err) {
      setEntries(SAMPLE_ENTRIES)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: entries.length,
    wins: entries.filter(e => e.outcome === 'Win').length,
    losses: entries.filter(e => e.outcome === 'Loss').length,
    winRate: entries.length > 0 ? Math.round((entries.filter(e => e.outcome === 'Win').length / entries.length) * 100) : 0,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const pnlVal = (parseFloat(form.exit || 0) - parseFloat(form.entry || 0)) * (parseFloat(form.size) || 1)
    const pnlCalc = pnlVal >= 0 ? `+$${Math.abs(pnlVal).toLocaleString()}` : `-$${Math.abs(pnlVal).toLocaleString()}`
    
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      pnl: pnlCalc,
      entry: parseFloat(form.entry) || 0,
      exit: parseFloat(form.exit) || 0,
    }
    try {
      const saved = await api.journal.createEntry(payload)
      setEntries(prev => [saved, ...prev])
    } catch {
      setEntries(prev => [{ ...payload, id: Date.now() }, ...prev])
    }
    setIsAdding(false)
    setForm({ symbol: '', setup: '', entry: '', exit: '', size: '', outcome: 'Win', mood: 'Disciplined', lesson: '', tags: '', date: new Date().toISOString().split('T')[0] })
  }

  const deleteEntry = async (id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    try { await api.journal.deleteEntry(id) } catch {}
  }

  if (loading && entries.length === 0) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-zinc-500 font-bold uppercase tracking-widest text-xs"
          >
            Retrieving Trade History...
          </motion.div>
        </div>
      )
  }

  return (
    <div className="relative min-h-screen pb-20">
      
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--orange-primary)]/10 blur-[120px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Institutional Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-1">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[var(--orange-primary)] shadow-[0_0_10px_var(--orange-primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--orange-primary)]">Personal Performance Ledger</span>
            </div>
            <h1 className="text-white text-5xl lg:text-7xl font-bold tracking-tighter leading-none uppercase">
              Trade <span className="text-[var(--orange-primary)]">Journal</span>
            </h1>
            <p className="text-zinc-500 text-sm font-medium tracking-wide max-w-xl">
              Systematic documentation of trade confluences, psychological metrics, and strategy execution accuracy.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="bg-[var(--orange-primary)] text-black font-bold px-10 py-5 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(255,145,0,0.2)] transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={18} strokeWidth={3} /> Add Trade Entry
          </motion.button>
        </div>

        {/* Global Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Journal Entries', value: stats.total, icon: ClipboardList, color: 'white' },
            { label: 'Trade Accuracy', value: `${stats.winRate}%`, icon: Zap, color: 'var(--green-profit)' },
            { label: 'Total Wins', value: stats.wins, icon: TrendingUp, color: 'var(--green-profit)' },
            { label: 'Total Losses', value: stats.losses, icon: Info, color: 'var(--red-loss)' },
          ].map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="backdrop-blur-3xl bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] shadow-xl group hover:border-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/5 rounded-xl text-zinc-500 group-hover:text-white transition-colors">
                  <s.icon size={18} />
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--orange-primary)]" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-3xl font-bold tracking-tighter" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Entry Matrix */}
        <div className="space-y-6">
          <AnimatePresence>
            {entries.map((entry, i) => {
              const outcome = OUTCOMES.find(o => o.label === entry.outcome)
              const mood = MOODS.find(m => m.label === entry.mood)
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.1 }}
                  className="backdrop-blur-3xl bg-white/[0.03] border border-white/5 rounded-[3rem] overflow-hidden group hover:border-[var(--orange-primary)]/20 transition-all duration-500 shadow-2xl relative"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                     <BookOpen size={100} strokeWidth={1} className="text-white" />
                  </div>

                  {/* Header Strip */}
                  <div className="p-8 lg:px-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-black/40 border border-white/10 flex items-center justify-center text-[var(--orange-primary)] font-bold text-xl shadow-inner">
                        {entry.symbol.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-white font-bold text-2xl tracking-tighter uppercase">{entry.symbol}</h3>
                           <div className={`px-4 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${outcome?.color}`}>
                             <Activity size={10} /> {entry.outcome}
                           </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                           <Calendar size={12} className="text-[var(--orange-primary)]" /> 
                           {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Realized Profit/Loss</p>
                          <p className={`text-4xl font-bold tracking-tighter ${entry.outcome === 'Win' ? 'text-[var(--green-profit)]' : 'text-[var(--red-loss)]'}`}>
                            {entry.pnl}
                          </p>
                       </div>
                       <div className="h-10 w-px bg-white/5 hidden lg:block" />
                       <button
                         onClick={() => deleteEntry(entry.id)}
                         className="p-4 bg-white/5 rounded-2xl text-[var(--red-loss)]/30 hover:text-[var(--red-loss)] hover:bg-[var(--red-loss)]/10 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                  </div>

                  {/* Trade Content */}
                  <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                    <div className="lg:col-span-8 space-y-10">
                      <div className="relative pl-8 border-l-2 border-[var(--orange-primary)]/20">
                        <div className="absolute top-0 -left-[5px] h-2 w-2 rounded-full bg-[var(--orange-primary)]" />
                        <h4 className="text-[10px] text-[var(--orange-primary)] font-bold uppercase tracking-widest mb-4">Trade Setup & Strategy</h4>
                        <p className="text-white/80 text-lg leading-relaxed font-medium">"{entry.setup}"</p>
                      </div>

                      <div className="relative pl-8 border-l-2 border-white/5">
                        <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Analysis & Insights</h4>
                        <p className="text-zinc-500 text-base leading-relaxed group-hover:text-zinc-300 transition-colors">
                          <Edit3 size={14} className="inline mr-3 opacity-50" />
                          {entry.lesson}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4">
                        {entry.tags.map(tag => (
                          <span key={tag} className="px-5 py-2 bg-black/40 border border-white/5 rounded-full text-[9px] font-bold text-zinc-500 uppercase tracking-widest hover:border-[var(--orange-primary)]/30 hover:text-white transition-all cursor-default">
                            #{tag.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                       <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl">
                          <h4 className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Trade Execution Specs</h4>
                          {[
                            { label: 'Entry Price', value: `$${entry.entry?.toLocaleString()}`, icon: ChevronRight },
                            { label: 'Exit Price', value: `$${entry.exit?.toLocaleString()}`, icon: ChevronRight },
                            { label: 'Position Size', value: entry.size, icon: Activity },
                            { label: 'Psychology', value: mood ? `${mood.emoji} ${mood.label}` : entry.mood, icon: Target },
                          ].map(r => (
                            <div key={r.label} className="flex justify-between items-center group/item pb-4 border-b border-white/5 last:border-0 last:pb-0">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 group-hover/item:text-white transition-colors">
                                <r.icon size={12} className="text-[var(--orange-primary)]" /> {r.label}
                              </span>
                              <span className="text-xs text-white font-bold">{r.value}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Log Modal */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-3xl bg-[#050505] border border-white/10 rounded-[3.5rem] overflow-hidden relative z-10 shadow-3xl max-h-[90vh] flex flex-col"
              >
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter flex items-center gap-4">
                       <div className="p-3 bg-[var(--orange-primary)] text-black rounded-2xl">
                          <Edit3 size={20} strokeWidth={3} />
                       </div>
                       New Journal Entry
                    </h2>
                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-3">Documenting trade execution and strategy adherence</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/30 transition-all">
                    <X size={24}/>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { label: 'Trading Symbol', key: 'symbol', placeholder: 'BTC/USDT, ETH/USD...' },
                      { label: 'Execution Date', key: 'date', type: 'date' },
                      { label: 'Entry Price ($)', key: 'entry', type: 'number', placeholder: 'Institutional Entry Price' },
                      { label: 'Exit Price ($)', key: 'exit', type: 'number', placeholder: 'Exit Trigger' },
                      { label: 'Position Size', key: 'size', placeholder: 'e.g., 2.50 BTC' },
                      { label: 'Strategy Tags (CSV)', key: 'tags', placeholder: 'LIQUIDITY, RSI, MACD' },
                    ].map(f => (
                      <div key={f.key} className={f.key === 'tags' ? 'col-span-2' : ''}>
                        <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">{f.label}</label>
                        <input
                          type={f.type || 'text'}
                          required
                          value={form[f.key]}
                          onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                          placeholder={f.placeholder}
                          className="w-full bg-black border border-white/10 rounded-[1.5rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-[var(--orange-primary)]/50 transition-all font-medium placeholder:text-zinc-800"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Trade Setup & Thesis</label>
                      <textarea required value={form.setup} onChange={e => setForm(p => ({...p, setup: e.target.value}))} rows="3" placeholder="Identify technical confluences..." className="w-full bg-black border border-white/10 rounded-[1.5rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-[var(--orange-primary)]/50 transition-all resize-none font-medium placeholder:text-zinc-800" />
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-3">Analysis & Post-Trade Review</label>
                      <textarea required value={form.lesson} onChange={e => setForm(p => ({...p, lesson: e.target.value}))} rows="3" placeholder="Performance insights..." className="w-full bg-black border border-white/10 rounded-[1.5rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-[var(--orange-primary)]/50 transition-all resize-none font-medium placeholder:text-zinc-800" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5">
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Trade Result</label>
                      <div className="flex gap-4">
                        {OUTCOMES.map(o => (
                          <button type="button" key={o.label} onClick={() => setForm(p => ({...p, outcome: o.label}))}
                            className={`flex-1 py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${form.outcome === o.label ? 'bg-[var(--orange-primary)] text-black border-transparent shadow-[0_0_20px_rgba(255,145,0,0.3)]' : 'bg-transparent border-white/10 text-zinc-500 hover:border-white/20'}`}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Psychological State</label>
                      <div className="flex gap-4 items-center justify-between">
                        {MOODS.map(m => (
                          <button type="button" key={m.label} onClick={() => setForm(p => ({...p, mood: m.label}))}
                            className={`text-3xl transition-all duration-300 ${form.mood === m.label ? 'grayscale-0 scale-150 drop-shadow-[0_0_10px_white]' : 'grayscale opacity-20 hover:opacity-50'}`} title={m.label}>
                            {m.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button type="submit" className="flex-1 bg-[var(--orange-primary)] text-black font-bold py-6 rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_40px_rgba(255,145,0,0.3)] flex items-center justify-center gap-4 uppercase tracking-widest text-sm">
                      <Save size={20} strokeWidth={3} /> Save Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
