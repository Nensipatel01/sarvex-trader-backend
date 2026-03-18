import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { TrendingUp, Briefcase, ShieldCheck, Activity } from 'lucide-react'
import api from '../services/api'

const timeframes = ['1D', '5D', '1M', '3M', '1Y', 'ALL']

export default function Portfolio() {
  const [tf, setTf] = useState('1M')
  const [summary, setSummary] = useState(null)
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState('all')

  useEffect(() => {
    async function init() {
      try {
        const accs = await api.brokers.list()
        setAccounts(accs || [])
      } catch (err) {
        console.error("Acc fetch error:", err)
      }
    }
    init()
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [sumData, posData] = await Promise.all([
          api.portfolio.getSummary(),
          api.portfolio.getPositions(selectedAccountId === 'all' ? undefined : selectedAccountId)
        ])
        if (sumData) setSummary(sumData)
        if (posData) setPositions(posData)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedAccountId])

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-zinc-500 font-bold uppercase tracking-widest text-xs"
        >
          Loading portfolio data...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, 45, 0],
            x: [0, 100, 0] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[var(--orange-primary)]/10 blur-[150px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay" />
      </div>

      <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-[1px] w-6 bg-zinc-800" />
              <h2 className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Trading Terminal / Portfolio Overview</h2>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tighter leading-none">
              Portfolio <span className="text-[var(--orange-primary)]">Performance</span>
            </h1>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest">Select Account:</span>
            <select 
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-white/5 border border-white/10 backdrop-blur-xl text-white text-[11px] font-bold px-6 py-3 rounded-2xl outline-none hover:border-white/20 transition-all uppercase tracking-widest shadow-2xl"
            >
              <option value="all" className="bg-[#050505]">Total Portfolio</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-[#050505]">{acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Balance Hero Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--orange-primary)]/0 to-[var(--orange-primary)]/0 rounded-[3rem] blur opacity-0 group-hover:opacity-10 transition duration-1000"></div>
          <div className="relative backdrop-blur-3xl bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] shadow-2xl overflow-hidden hover:border-white/20 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8">
              <ShieldCheck size={32} className="text-[var(--orange-primary)]/20 group-hover:text-[var(--orange-primary)] transition-colors duration-700" />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-end gap-8">
              <div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={12} className="text-[var(--orange-primary)]" /> Real-time Portfolio Value
                </p>
                <div className="flex items-baseline gap-4 mt-1">
                  <h1 className="text-white text-6xl font-bold tracking-tighter leading-none">
                    ${summary?.total_balance.toLocaleString()}
                  </h1>
                  <motion.span 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[var(--green-profit)] text-black flex items-center gap-1.5 py-1 px-4 rounded-full text-[11px] font-bold tracking-tighter uppercase"
                  >
                    <TrendingUp size={14} />+{summary?.daily_pnl_percent}%
                  </motion.span>
                </div>
              </div>

              <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                {timeframes.map(t => (
                  <button 
                    key={t}
                    onClick={() => setTf(t)}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${t === tf ? 'bg-[var(--orange-primary)] text-black shadow-lg shadow-[var(--orange-primary)]/20' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[250px] w-full mt-12 group-hover:brightness-110 transition-all duration-500 overflow-visible">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.equity_curve || []}>
                  <defs>
                    <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--orange-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--orange-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 900 }} dy={10} />
                  <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, backdropFilter: 'blur(20px)', color: '#ffffff', fontSize: '10px', fontWeight: 900 }}
                    itemStyle={{ color: 'var(--orange-primary)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--orange-primary)" strokeWidth={4} fill="url(#equity)" dot={false} isAnimationActive={true} animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Secondary Stats Cluster */}
          <div className="grid grid-cols-2 gap-6">
            <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:border-[var(--orange-primary)]/30 transition-all duration-500">
              <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.3em] mb-6 italic">Risk Exposure</p>
              <div className="relative w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ v: 68 }, { v: 32 }]} dataKey="v" innerRadius={50} outerRadius={65} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={true}>
                      <Cell fill="var(--orange-primary)" />
                      <Cell fill="rgba(255,255,255,0.05)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-3xl font-black font-space italic leading-none">68<span className="text-xs">%</span></span>
                </div>
              </div>
              <span className="text-[var(--orange-primary)] text-[10px] font-black uppercase tracking-[0.4em] mt-6 italic bg-[var(--orange-primary)]/10 px-4 py-1.5 rounded-full border border-[var(--orange-primary)]/20 shadow-[0_0_20px_rgba(255,145,0,0.1)]">MODERATE</span>
            </div>

            <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-8 group hover:border-white/20 transition-all duration-500">
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Asset Allocation</p>
              {[{ name: 'Crypto', pct: 65, color: 'var(--orange-primary)' }, { name: 'Stocks', pct: 35, color: 'rgba(255,255,255,0.4)' }].map(item => (
                <div key={item.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ background: item.color, color: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-white text-xs font-black italic">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full" 
                      style={{ width: `${item.pct}%`, background: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Positions Terminal */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] group hover:border-white/20 transition-all duration-500">
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex items-center gap-3">
                <Briefcase size={18} className="text-[var(--orange-primary)]" />
                <h2 className="text-white font-bold text-xl uppercase tracking-tight">Open Positions</h2>
              </div>
              <button className="text-[var(--orange-primary)] text-[9px] font-bold uppercase tracking-widest hover:text-white transition-all">View All Positions</button>
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {positions.length > 0 ? positions.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={p.symbol} 
                  className="bg-black/40 border border-white/5 backdrop-blur-md p-5 rounded-[1.8rem] flex items-center justify-between cursor-crosshair group/item hover:border-[var(--orange-primary)]/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-[var(--orange-primary)] text-xl group-hover/item:bg-[var(--orange-primary)] group-hover/item:text-black transition-all duration-500 shadow-inner">
                      {p.symbol[0]}
                    </div>
                    <div>
                      <div className="text-white font-black text-[15px] italic tracking-tight">{p.symbol}</div>
                      <div className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mt-0.5">Entry: ${p.entry_price?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-lg italic ${p.pnl >= 0 ? 'text-[var(--green-profit)]' : 'text-[var(--red-loss)]'}`}>
                      {p.pnl >= 0 ? '+' : ''}${Math.abs(p.pnl).toLocaleString()}
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${p.pnl >= 0 ? 'text-[var(--green-profit)]' : 'text-[var(--red-loss)]'} opacity-60`}>
                      {p.pnl >= 0 ? 'PROFIT' : 'LOSS'}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20 opacity-30 italic font-black text-[10px] uppercase tracking-[0.5em]">No Active Operations Found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
