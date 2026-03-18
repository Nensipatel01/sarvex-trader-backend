import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, BarChart2, TrendingUp, AlertCircle, History, Zap, Settings } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'

export default function Backtest() {
  const [params, setParams] = useState({
    symbol: 'BTC',
    timeframe: '1D',
    sma_fast: 10,
    sma_slow: 50
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleRun = async () => {
    setLoading(true)
    try {
      const res = await api.backtest.run(params)
      setResults(res)
    } catch (err) {
      console.error("Backtest failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Strategy Backtest</h1>
          <p className="text-[#7c5a40] font-bold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <History size={14} className="text-orange-500" /> Historical Simulation Engine
          </p>
        </div>
        <button 
          onClick={handleRun}
          disabled={loading}
          className="bg-orange-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-white transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Zap className="animate-spin" size={20} /> : <Play size={20} />}
          Run Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Parameters Panel */}
        <div className="lg:col-span-4 bg-[#120a00] border border-[#1c1000] p-8 rounded-[32px] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={18} className="text-orange-500" />
            <h2 className="text-white font-bold text-sm uppercase tracking-widest">Strategy Parameters</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-[#5c4030] uppercase mb-2 block">Asset Symbol</label>
              <select 
                value={params.symbol}
                onChange={(e) => setParams({...params, symbol: e.target.value})}
                className="w-full bg-black/40 border border-[#1c1000] p-4 rounded-xl text-white outline-none focus:border-orange-500 font-bold"
              >
                <option>BTC</option>
                <option>ETH</option>
                <option>SOL</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-[#5c4030] uppercase mb-2 block">SMA Fast</label>
                <input 
                  type="number"
                  value={params.sma_fast}
                  onChange={(e) => setParams({...params, sma_fast: parseInt(e.target.value)})}
                  className="w-full bg-black/40 border border-[#1c1000] p-4 rounded-xl text-white outline-none focus:border-orange-500 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#5c4030] uppercase mb-2 block">SMA Slow</label>
                <input 
                  type="number"
                  value={params.sma_slow}
                  onChange={(e) => setParams({...params, sma_slow: parseInt(e.target.value)})}
                  className="w-full bg-black/40 border border-[#1c1000] p-4 rounded-xl text-white outline-none focus:border-orange-500 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Dashboard */}
        <div className="lg:col-span-8 space-y-8">
          {results ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Return', value: `${results.metrics.total_return_pct}%`, icon: <TrendingUp size={16} />, color: 'text-green-500' },
                  { label: 'Win Rate', value: `${results.metrics.win_rate}%`, icon: <Zap size={16} />, color: 'text-yellow-500' },
                  { label: 'Max Drawdown', value: `${results.metrics.max_drawdown_pct}%`, icon: <AlertCircle size={16} />, color: 'text-red-500' },
                  { label: 'Sharpe Ratio', value: results.metrics.sharpe_ratio, icon: <BarChart2 size={16} />, color: 'text-blue-500' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#120a00] border border-[#1c1000] p-6 rounded-[24px]">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#5c4030] uppercase tracking-widest mb-2">
                       {stat.icon} {stat.label}
                    </div>
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[#120a00] border border-[#1c1000] p-8 rounded-[32px] h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-white font-black text-sm uppercase tracking-widest italic">Equity Curve (Performance)</h2>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={results.equity_curve}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1000" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                    <Tooltip 
                      contentStyle={{ background: '#120a00', border: '1px solid #3d2700', borderRadius: '12px' }}
                      itemStyle={{ color: '#f97316', fontWeight: 'black' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#f97316" fillOpacity={1} fill="url(#equityGradient)" strokeWidth={4} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-[#1c1000] rounded-[32px] text-center p-12">
               <div className="bg-[#1c1000] p-6 rounded-[24px] mb-6">
                 <History size={48} className="text-[#5c4030]" />
               </div>
               <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-2">Simulation Ready</h3>
               <p className="text-[#5c4030] font-bold text-sm max-w-sm">Configure your strategy parameters on the left and hit "Run Simulation" to analyze 120 days of historical data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
