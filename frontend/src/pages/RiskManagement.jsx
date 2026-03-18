import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, ReferenceLine
} from 'recharts'
import { Shield, AlertTriangle, TrendingDown, Activity, Zap, CheckCircle2, Lock, Eye, ArrowUpRight, ArrowDownRight, Info, Settings } from 'lucide-react'
import api from '../services/api'

export default function RiskManagement() {
  const [riskData, setRiskData] = useState(null)
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRiskData()
  }, [])

  const loadRiskData = async () => {
    setLoading(true)
    try {
      const [rData, pData] = await Promise.all([
        api.risk.getStatus(),
        api.portfolio.getPositions()
      ])
      setRiskData(rData)
      setPositions(pData)
    } catch (err) {
      console.error("Risk data fetch failed", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClosePosition = async (id) => {
    if (confirm("Terminate this position across the bridge?")) {
      alert("Closing signal sent to execution engine.")
      loadRiskData()
    }
  }

  const totalEquity = riskData?.total_equity || 0
  const usedMargin = riskData?.total_exposure || 0
  const usedPct = riskData?.margin_usage || 0
  const dailyPnl = riskData?.daily_pnl || 0
  const openPositionsCount = riskData?.open_positions || 0

  // Mock drawdown data for the chart
  const ddData = Array.from({ length: 40 }).map((_, i) => ({
    day: i,
    drawdown: -(Math.random() * 12).toFixed(2)
  }))

  const exposureData = riskData?.risk_heatmap?.map(item => ({
    name: item.sector, 
    value: item.exposure, 
    fill: item.exposure < 20 ? '#10b981' : item.exposure < 50 ? '#f59e0b' : '#ef4444'
  })) || []

  return (
    <div className="space-y-10 font-['Inter']">
      
      {/* Risk Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Risk Management</h2>
          <h1 className="text-4xl font-bold tracking-tight">Portfolio Risk Controls</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-xl">
            Real-time exposure monitoring, drawdown management, and position-level risk metrics synchronized via secure gateway.
          </p>
        </div>
        
        <div className={`px-6 py-3 rounded-2xl border font-bold text-xs uppercase tracking-widest flex items-center gap-3 ${
          usedPct > 60 
          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${usedPct > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          System Health: {usedPct > 60 ? 'Warning' : 'Healthy'}
        </div>
      </div>

      <main className="space-y-8">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Equity', value: `$${totalEquity.toLocaleString()}`, icon: Shield, color: 'text-white' },
            { label: 'Margin Usage', value: `${usedPct}%`, icon: Lock, color: usedPct > 60 ? 'text-rose-500' : 'text-emerald-500' },
            { label: 'Daily P&L', value: `${dailyPnl >= 0 ? '+' : ''}$${dailyPnl.toLocaleString()}`, icon: Activity, color: dailyPnl >= 0 ? 'text-emerald-500' : 'text-rose-500' },
            { label: 'Open Positions', value: openPositionsCount, icon: Zap, color: 'text-[var(--orange-primary)]' },
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-[#121212] border border-white/5 space-y-4">
               <div className="flex items-center gap-3 text-zinc-500">
                  <stat.icon size={16} strokeWidth={3} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
               </div>
               <div className={`text-2xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Risk Chart */}
          <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-[#121212] border border-white/5 space-y-8">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Total Portfolio Drawdown</h3>
                <div className="flex gap-2">
                   <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-zinc-500">Historical Sync</div>
                </div>
             </div>
             
             <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={ddData}>
                  <defs>
                    <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis hide dataKey="day" />
                  <YAxis hide domain={['dataMin - 5', 0]} />
                  <Tooltip contentStyle={{ background: '#121212', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, fontSize: 10 }} />
                  <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#ddGrad)" isAnimationActive />
                </AreaChart>
             </ResponsiveContainer>
             
             <div className="flex justify-between items-center px-2">
                <div className="space-y-1">
                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Max Drawdown</p>
                   <p className="text-xl font-bold text-rose-500">12.8%</p>
                </div>
                <div className="space-y-1 text-center">
                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Sharpe Ratio</p>
                   <p className="text-xl font-bold text-white">1.42</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Profit Factor</p>
                   <p className="text-xl font-bold text-emerald-500">2.11</p>
                </div>
             </div>
          </div>

          {/* Exposure Distribution */}
          <div className="p-10 rounded-[2.5rem] bg-[#121212] border border-white/5 space-y-8">
             <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Sector Allocation</h3>
             <div className="relative h-[200px] flex items-center justify-center">
                <div className="space-y-4 w-full relative z-10">
                   {exposureData.map((exp, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                           <span className="text-zinc-500 uppercase tracking-widest">{exp.name}</span>
                           <span className="text-white">{exp.value}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${exp.value}%` }}
                             className="h-full rounded-full"
                             style={{ backgroundColor: exp.fill }}
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <p className="text-[10px] text-zinc-500 font-medium leading-relaxed text-center">
                Allocations are calculated relative to account equity and adjusted for risk weight.
             </p>
          </div>
        </div>

        {/* Position Risk Table */}
        <div className="rounded-[2.5rem] bg-[#121212] border border-white/5 overflow-hidden">
           <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Security Monitoring</h3>
              <button className="text-[10px] font-bold text-[var(--orange-primary)] uppercase tracking-widest flex items-center gap-2">
                 <Settings size={14} /> Risk Settings
              </button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-white/5">
                       {['Asset', 'Sync Status', 'Exposure', 'Profit/Loss', 'Risk Status', 'Action'].map(h => (
                         <th key={h} className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {positions.map((p, i) => {
                      const exposure = totalEquity > 0 ? ((p.size * p.entry_price) / totalEquity * 100).toFixed(1) : 0
                      const riskGrade = exposure > 20 ? 'Critical' : exposure > 10 ? 'Elevated' : 'Normal'
                      return (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                           <td className="px-8 py-6">
                              <div className="font-bold text-white uppercase tracking-tight">{p.symbol}</div>
                              <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{p.size} Units</div>
                           </td>
                           <td className="px-8 py-6">
                              <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest w-fit ${
                                p.type === 'LONG' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                              }`}>
                                 {p.type} Side
                              </div>
                           </td>
                           <td className="px-8 py-6 font-bold text-zinc-400 tabular-nums">{exposure}%</td>
                           <td className={`px-8 py-6 font-bold tabular-nums ${p.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {p.pnl >= 0 ? '+' : ''}${p.pnl?.toLocaleString()}
                           </td>
                           <td className="px-8 py-6">
                              <div className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest w-fit border ${
                                riskGrade === 'Normal' ? 'text-emerald-500 border-emerald-500/20' : riskGrade === 'Critical' ? 'text-rose-500 border-rose-500/20' : 'text-orange-500 border-orange-500/20'
                              }`}>
                                 {riskGrade}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <button 
                                onClick={() => handleClosePosition(p.id)}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 transition-all"
                              >
                                 Close Position
                              </button>
                           </td>
                        </tr>
                      )
                    })}
                    {positions.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-20 text-center text-zinc-600 font-medium text-xs">
                           No open positions detected in transmission.
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  )
}
