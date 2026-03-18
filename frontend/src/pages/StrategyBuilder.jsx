import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Play, Save, History } from 'lucide-react'
import api from '../services/api'

const CONDITIONS = [
  { id: 'rsi_lt_30', label: 'RSI Support', desc: 'Relative Strength Index (14) < 30', icon: '📉', category: 'Momentum' },
  { id: 'rsi_gt_70', label: 'RSI Resistance', desc: 'Relative Strength Index (14) > 70', icon: '📈', category: 'Momentum' },
  { id: 'price_gt_ema50', label: 'Trend Verification', desc: 'Price > EMA 50 (Systemic Bullish)', icon: '📊', category: 'Trend' },
  { id: 'macd_cross', label: 'MACD Divergence', desc: 'MACD line cross over Signal line', icon: '🔁', category: 'Momentum' },
]

const ACTIONS = [
  { id: 'market_buy', label: 'Direct Market Execution', size: '2.5% Allocation' },
  { id: 'limit_buy', label: 'Tiered Limit Buy', size: '5% Allocation' },
]

function ConditionBlock({ cond, onRemove }) {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 relative group hover:border-[var(--orange-primary)]/20 transition-all shadow-xl">
      <div className="bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] text-[9px] font-bold px-3 py-1 rounded-full inline-block mb-4 uppercase tracking-widest border border-[var(--orange-primary)]/10">
        Logic Parameter: IF
      </div>
      <div className="flex items-center gap-6">
        <div className="text-4xl p-4 bg-white/5 rounded-2xl grayscale group-hover:grayscale-0 transition-all">{cond.icon}</div>
        <div className="flex-1">
          <div className="text-white font-bold text-xl uppercase tracking-tighter">{cond.label}</div>
          <div className="text-zinc-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{cond.desc}</div>
        </div>
      </div>
      <button onClick={onRemove} className="absolute top-8 right-8 p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export default function StrategyBuilder() {
  const [conditions, setConditions] = useState([CONDITIONS[0]])
  const [action, setAction] = useState(ACTIONS[0])
  const [showLib, setShowLib] = useState(false)
  const [name, setName] = useState('New Momentum Strategy')
  const [saved, setSaved] = useState(false)
  const [library, setLibrary] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState('')

  useEffect(() => {
    async function loadLib() {
      try {
        const [stratData, accData] = await Promise.all([
          api.strategy.getLibrary(),
          api.brokers.list()
        ])
        if (stratData) setLibrary(stratData)
        if (accData) {
          setAccounts(accData)
          if (accData.length > 0) setSelectedAccountId(accData[0].id)
        }
      } catch (err) {
        console.error("Initialization error:", err)
      }
    }
    loadLib()
  }, [])

  const addCondition = (c) => {
    if (!conditions.find(x => x.id === c.id)) setConditions([...conditions, c])
    setShowLib(false)
  }

  const saveStrategy = async () => {
    try {
      const data = await api.strategy.createStrategy({ 
        name, 
        blocks: conditions,
        broker_account_id: selectedAccountId === '' ? null : parseInt(selectedAccountId)
      })
      if (data) {
        setSaved(true)
        const updatedLib = await api.strategy.getLibrary()
        if (updatedLib) setLibrary(updatedLib)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error("Failed to save strategy", err)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-10 px-1">
        <div>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="bg-transparent border-none text-white text-4xl font-bold tracking-tighter uppercase outline-none w-full placeholder:opacity-20"
            placeholder="UNTITLED STRATEGY"
          />
          <div className="flex items-center gap-6 mt-3">
             <div className="text-[var(--orange-primary)] text-[11px] font-bold uppercase tracking-widest italic flex items-center gap-2">
               <Shield size={14} /> Systemic Logic Protocol • {conditions.length} Layers
             </div>
             <div className="h-4 w-[1px] bg-white/10" />
             <div className="flex items-center gap-3">
                <label className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Execution Target:</label>
                <select 
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="bg-white/5 border border-white/5 text-[var(--orange-primary)] text-[10px] font-bold uppercase px-3 py-1 rounded-lg outline-none focus:border-[var(--orange-primary)]/40 transition-all cursor-pointer"
                >
                  <option value="">Simulation Mode (Offline)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                  ))}
                </select>
             </div>
          </div>
        </div>
        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={saveStrategy} className="flex-1 xl:px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            <Save size={18} className="inline mr-3" />{saved ? 'Protocol Archived' : 'Archive Protocol'}
          </button>
          <button className="flex-1 xl:px-8 py-4 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            <Play size={18} className="inline mr-3" />Initiate Verification
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Logic Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {conditions.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <ConditionBlock cond={c} onRemove={() => setConditions(conditions.filter(x => x.id !== c.id))} />
                {i < conditions.length - 1 && (
                  <div className="flex justify-center">
                    <div className="bg-white/5 border border-white/5 text-zinc-400 text-[11px] font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-xl backdrop-blur-md">
                      Sequential Integration (AND)
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={() => setShowLib(true)}
            className="w-full py-12 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] text-zinc-600 hover:bg-white/[0.04] hover:border-[var(--orange-primary)]/40 transition-all flex flex-col items-center gap-4 group"
          >
            <div className="p-4 rounded-full bg-white/5 border border-white/5 group-hover:bg-[var(--orange-primary)]/10 transition-colors">
              <Plus size={32} className="group-hover:text-[var(--orange-primary)] transition-colors" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">Integrate Logic Parameter</span>
          </button>

          {/* THEN Block */}
          <div className="bg-[#121212] border border-white/5 border-t-8 border-t-green-500 rounded-[2.5rem] mt-12 p-10 shadow-2xl">
            <div className="bg-green-500/10 text-green-500 text-[10px] font-bold px-4 py-1.5 rounded-full inline-block uppercase tracking-widest border border-green-500/10 mb-10">
              Output Execution: THEN
            </div>
            
            <div className="space-y-10">
              <div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Execution Protocol</p>
                <div className="flex flex-wrap gap-3">
                  {ACTIONS.map(a => (
                    <button 
                      key={a.id} 
                      onClick={() => setAction(a)}
                      className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${action.id === a.id ? 'bg-green-500/10 border-green-500 text-green-500 shadow-xl shadow-green-500/5' : 'bg-transparent border-white/5 text-zinc-500 hover:text-white hover:border-white/20'}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-inner">
                 <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Risk-Adjusted Allocation</p>
                 <div className="text-5xl font-bold text-green-500 tracking-tighter">{action.size}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Library */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-white font-bold text-xl uppercase tracking-tighter flex items-center gap-3">
            <History size={20} className="text-[var(--orange-primary)]" />
            Archived Strategies
          </h2>
          <div className="space-y-3">
            {library.map(s => (
              <div key={s.id} className="bg-[#121212] border border-white/5 rounded-2xl p-6 cursor-pointer group hover:border-[var(--orange-primary)]/20 transition-all shadow-xl">
                 <div className="text-white font-bold text-sm uppercase group-hover:text-[var(--orange-primary)] transition-colors">{s.name}</div>
                 <div className="flex justify-between mt-4">
                    <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">{Array.isArray(s.blocks) ? s.blocks.length : 0} Logic Blocks</span>
                    <span className="text-green-500 text-[10px] font-bold uppercase">{s.performance_summary?.win_rate || 'N/A'} Accuracy</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lib Modal */}
      <AnimatePresence>
        {showLib && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-6 flex items-center justify-center"
            onClick={() => setShowLib(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="card max-w-2xl w-full max-h-[85vh] overflow-y-auto border-[var(--orange-primary)] border-t-[1rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-[var(--border-color)]">
                 <h2 className="text-white font-black text-3xl italic uppercase font-space tracking-tighter">Conditions Catalog</h2>
                 <button onClick={() => setShowLib(false)} className="text-white/40 text-4xl font-black hover:text-[var(--orange-primary)] transition-colors">×</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CONDITIONS.map(c => (
                  <div key={c.id} onClick={() => addCondition(c)} className="card card-hover flex items-center gap-5 cursor-pointer p-6 group">
                    <div className="text-4xl grayscale group-hover:grayscale-0 transition-all scale-110">{c.icon}</div>
                    <div className="flex-1">
                      <div className="text-white font-black text-base transition-colors group-hover:text-[var(--orange-primary)]">{c.label}</div>
                      <div className="text-[var(--text-muted)] text-[9px] font-black uppercase mt-1 tracking-widest">{c.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
