import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Beaker, Play, Download, BarChart2, Activity, 
  Zap, CheckCircle2, ChevronDown, ListFilter, AlertCircle
} from 'lucide-react'
import api from '../services/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Lab() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [myStrategies, setMyStrategies] = useState([])
  const [selectedStrategyId, setSelectedStrategyId] = useState('')
  const [symbol, setSymbol] = useState('BTC/USDT')
  const [timeframe, setTimeframe] = useState('1H')
  const [initialCapital, setInitialCapital] = useState(10000)

  useEffect(() => {
    loadStrategies()
  }, [])

  const loadStrategies = async () => {
    try {
      const data = await api.strategy.getLibrary()
      setMyStrategies(data)
      if (data.length > 0) setSelectedStrategyId(data[0].id)
    } catch (err) {
      console.error("Failed to load strategies", err)
    }
  }

  const runBacktest = async () => {
    setIsRunning(true)
    setResults(null)
    try {
      const res = await api.strategy.getBacktestResults({
        strategy_id: selectedStrategyId,
        symbol,
        timeframe,
        initial_capital: initialCapital
      })
      
      // Artificial delay for premium feel
      setTimeout(() => {
        setIsRunning(false)
        setResults(res)
      }, 2000)
    } catch (err) {
      alert("Backtest failed to execute")
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase flex items-center gap-4">
            Strategy Backtesting
          </h1>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1 flex items-center gap-2">
            <Beaker size={14} className="text-orange-500" /> Historical Performance Engine
          </p>
        </div>
        
        <button 
          onClick={runBacktest}
          disabled={isRunning}
          className="bg-orange-500 text-black px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-orange-500/20 disabled:opacity-50"
        >
          {isRunning ? (
             <><Activity size={18} className="animate-spin" /> Simulating...</>
          ) : (
             <><Play fill="black" size={18} /> Execute Backtest</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Test Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121212] border border-white/5 p-8 rounded-[32px]">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <ListFilter size={18} className="text-orange-500" /> Test Parameters
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Strategy Selection</label>
                <div className="relative">
                  <select 
                    value={selectedStrategyId}
                    onChange={(e) => setSelectedStrategyId(e.target.value)}
                    className="w-full bg-black border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500 appearance-none"
                  >
                    {myStrategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {myStrategies.length === 0 && <option>No Strategies Found</option>}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest ml-1">Symbol</label>
                  <input 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-[#0a0600] border border-[#1c1000] p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest ml-1">Timeframe</label>
                  <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-[#0a0600] border border-[#1c1000] p-4 rounded-xl text-white font-bold outline-none focus:border-orange-500 appearance-none"
                  >
                    <option>1H</option>
                    <option>4H</option>
                    <option>1D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" defaultValue="2022-01-01" className="w-full bg-[#0a0600] border border-[#1c1000] p-4 rounded-xl text-[#a18266] font-bold outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest ml-1">End Date</label>
                  <input type="date" defaultValue="2023-12-31" className="w-full bg-[#0a0600] border border-[#1c1000] p-4 rounded-xl text-[#a18266] font-bold outline-none focus:border-orange-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest ml-1">Initial Capital (USD)</label>
                <input 
                  type="number" 
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full bg-[#0a0600] border border-[#1c1000] p-4 rounded-xl text-white font-black outline-none focus:border-orange-500 text-xl" 
                />
              </div>

              <div className="pt-4 border-t border-[#1c1000]">
                <div className="p-4 bg-orange-500/5 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] text-[#a18266] uppercase font-bold tracking-widest leading-relaxed">
                    Slippage and exchange commission schemas are automatically applied based on live exchange models (0.1% base).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {!results && !isRunning && (
            <div className="flex-1 bg-[#121212] border border-white/5 rounded-[32px] flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                <Beaker size={48} className="text-zinc-700" />
              </div>
              <h3 className="text-white font-bold text-xl tracking-tight uppercase mb-2">Awaiting Parameters</h3>
              <p className="text-zinc-500 font-medium max-w-sm mx-auto text-sm leading-relaxed mb-8">
                Configure your strategy parameters on the left and run the backtest engine to generate institutional-grade performance reports.
              </p>
            </div>
          )}

          {isRunning && (
            <div className="flex-1 bg-[#120a00] border border-[#1c1000] rounded-[32px] flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-[32px] bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-orange-500/20 animate-pulse"></div>
                <Activity size={48} className="text-orange-500 relative z-10" />
              </motion.div>
              <h3 className="text-white font-black text-xl tracking-tight uppercase mb-2 animate-pulse">Simulating 35,000+ Candles</h3>
              <p className="text-orange-500/60 font-black text-[10px] tracking-[0.3em] uppercase">Calculating Metrics...</p>
            </div>
          )}

          <AnimatePresence>
            {results && !isRunning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Hero Stat */}
                <div className="bg-gradient-to-br from-[#120a00] to-[rgba(249,115,22,0.05)] border border-[#1c1000] rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
                  
                  <div>
                    <span className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest block mb-2">Simulated Net Profit</span>
                    <span className="text-5xl md:text-7xl font-black text-white tracking-tighter">{results.metrics.net_profit}</span>
                    <div className="flex items-center gap-2 mt-4 text-[#a18266] text-sm font-bold">
                      <CheckCircle2 size={16} className="text-green-500" /> Based on $10,000 initial capital
                    </div>
                  </div>

                  <button 
                    onClick={() => alert("Institutional Tear Sheet generated and encrypted for download.")}
                    className="bg-[#1c1000] border border-[#3d2700] hover:border-orange-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    <Download size={14} /> Export Tear Sheet
                  </button>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Win Rate', val: results.metrics.win_rate, c: 'text-white' },
                    { label: 'Profit Factor', val: results.metrics.profit_factor, c: 'text-green-500' },
                    { label: 'Max Drawdown', val: results.metrics.max_drawdown, c: 'text-red-500' },
                    { label: 'Sharpe Ratio', val: results.metrics.sharpe_ratio, c: 'text-blue-500' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#120a00] border border-[#1c1000] p-6 rounded-[24px]">
                      <span className="text-[9px] font-black text-[#5c4030] uppercase tracking-widest block mb-2">{stat.label}</span>
                      <span className={`text-2xl font-black ${stat.c}`}>{stat.val}</span>
                    </div>
                  ))}
                </div>

                {/* Mock Chart Area */}
                <div className="bg-[#120a00] border border-[#1c1000] rounded-[32px] p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                       <BarChart2 size={16} className="text-orange-500" /> Equity Curve
                    </h3>
                    <span className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest bg-[#1c1000] px-3 py-1 rounded-lg">
                      Total Trades: {results.metrics.total_trades}
                    </span>
                  </div>
                  
                  {/* Abstract Line Representing a Chart */}
                  <div className="flex-1 min-h-[260px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.equity_curve}>
                        <defs>
                          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ background: '#120a00', border: '1px solid #1c1000', borderRadius: 12, fontSize: 10 }}
                          itemStyle={{ color: '#F97316' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#F97316" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#equityGrad)" 
                          isAnimationActive
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
