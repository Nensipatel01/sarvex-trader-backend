import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers, Activity, TrendingUp, BarChart2, Zap, 
  AlertTriangle, Shield, Search, ChevronRight, Hash, Brain, Info
} from 'lucide-react'
import api from '../services/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, Legend } from 'recharts'

export default function Options() {
  const [symbol, setSymbol] = useState('BTC')
  const [expiry, setExpiry] = useState('')
  const [chain, setChain] = useState([])
  const [spot, setSpot] = useState(0)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [selectedStrike, setSelectedStrike] = useState(null)
  const [surface, setSurface] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [chainData, sumData, surfaceData] = await Promise.all([
          api.options.getChain(symbol, expiry),
          api.options.getSummary(),
          api.options.getVolatilitySurface(symbol)
        ])
        setChain(chainData.chain || [])
        setSpot(chainData.spot || 0)
        setExpiry(chainData.expiry || '')
        setSummary(sumData)
        setSurface(surfaceData.surface || [])
      } catch (err) {
        console.error('Options error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [symbol, expiry])

  const greeks = useMemo(() => {
    if (!chain?.length) return []
    // Use selected strike if available, otherwise ATM
    const target = selectedStrike || chain.find(c => c.type === 'call' && c.strike >= spot) || chain[0]
    return [
      { name: 'Delta', value: target.delta, desc: 'Price Sensitivity', color: 'text-green-500' },
      { name: 'Gamma', value: target.gamma, desc: 'Delta Acceleration', color: 'text-orange-500' },
      { name: 'Theta', value: target.theta, desc: 'Time Decay (1D)', color: 'text-red-500' },
      { name: 'Vega', value: target.vega, desc: 'Impact of 1% Vol Change', color: 'text-blue-500' },
    ]
  }, [chain, spot, selectedStrike])

  const payoffData = useMemo(() => {
    if (!selectedStrike) return []
    const strike = selectedStrike.strike
    const premium = selectedStrike.ask
    const type = selectedStrike.type
    
    const range = strike * 0.3 // Wider range
    const data = []
    for (let s = strike - range; s <= strike + range; s += (range * 2) / 40) {
      let profit = 0
      if (type === 'call') {
        profit = Math.max(0, s - strike) - premium
      } else {
        profit = Math.max(0, strike - s) - premium
      }
      data.push({
        price: Math.round(s),
        pnl: Math.round(profit)
      })
    }
    return data
  }, [selectedStrike])

  // Volatility Surface Data Processing
  const surfaceChartData = useMemo(() => {
    if (!surface || !surface.length) return []
    
    // Group by strike to have one data point per strike with multiple lines for expirations
    const grouped = {}
    surface.forEach(point => {
      const { strike, iv, expiry } = point
      if (!grouped[strike]) grouped[strike] = { strike }
      
      // Simplify expiry name for the legend (e.g., '2026-03-21' -> '03-21')
      const shortExpiry = expiry.substring(5)
      grouped[strike][shortExpiry] = iv
    })
    
    return Object.values(grouped).sort((a, b) => a.strike - b.strike)
  }, [surface])

  // Get unique expirations for Vol Surface chart lines
  const uniqueExpirations = useMemo(() => {
    if (!surface || !surface.length) return []
    return [...new Set(surface.map(p => p.expiry.substring(5)))]
  }, [surface])

  if (loading && !chain.length) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-orange-500 font-black italic tracking-tighter text-xl animate-pulse uppercase">Linking Derivatives Desk...</div>
      </div>
    )
  }

  const calls = chain.filter(c => c.type === 'call')
  const puts = chain.filter(c => c.type === 'put')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
            Derivatives Desk
          </h1>
          <p className="text-[#7c5a40] font-bold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <Layers size={14} className="text-orange-500" /> Options Chain & Volatility Analytics
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-[10px] font-black uppercase text-[#5c4030]">Market VIX</p>
            <p className="text-white font-black text-lg">{summary?.vix}%</p>
          </div>
          <select 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-[#120a00] border border-[#1c1000] text-white font-bold p-3 rounded-xl outline-none focus:border-orange-500 text-sm"
          >
            <option>BTC</option>
            <option>ETH</option>
            <option>SOL</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Greeks Dashboard */}
        <div className="lg:col-span-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {greeks.map((g) => (
              <div key={g.name} className="bg-[#120a00] border border-[#1c1000] p-6 rounded-[24px] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] font-black text-[#5c4030] uppercase tracking-widest mb-1">{g.desc}</div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-black text-white">{g.name}</span>
                  <span className={`text-xl font-black ${g.color}`}>{g.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volatility Surface Smile */}
        <div className="lg:col-span-12">
           <div className="bg-[#120a00] border border-[#1c1000] rounded-[32px] p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={18} className="text-orange-500" /> Implied Volatility Surface (Smile)
                </h2>
                <div className="flex gap-4">
                  {uniqueExpirations.map((exp, i) => (
                    <div key={exp} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7c5a40]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? '#3b82f6' : i === 1 ? '#eab308' : '#ec4899' }} />
                      {exp}
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={surfaceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1c1000" vertical={false} />
                   <XAxis dataKey="strike" stroke="#5c4030" tick={{ fill: '#7c5a40', fontSize: 10, fontWeight: 'bold' }} tickMargin={10} minTickGap={30} />
                   <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                   <Tooltip 
                     contentStyle={{ background: '#120a00', border: '1px solid #3d2700', borderRadius: '12px' }}
                     labelStyle={{ color: '#7c5a40', fontWeight: 'bold' }}
                     itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                     formatter={(value) => [`${value}% IV`, '']}
                   />
                   {uniqueExpirations.map((exp, i) => (
                     <Line 
                       key={exp}
                       type="monotone" 
                       dataKey={exp} 
                       stroke={i === 0 ? '#3b82f6' : i === 1 ? '#eab308' : '#ec4899'} 
                       strokeWidth={3} 
                       dot={{ fill: '#120a00', strokeWidth: 2, r: 4 }} 
                       activeDot={{ r: 6, fill: '#fff' }}
                     />
                   ))}
                   {/* Mark Spot Price */}
                   <ReferenceLine x={spot} stroke="#f97316" strokeDasharray="3 3" label={{ position: 'top', value: 'SPOT', fill: '#f97316', fontSize: 10, fontWeight: 'bold' }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* Option Chain */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#120a00] border border-[#1c1000] rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1c1000] bg-white/[0.01] flex justify-between items-center">
              <h2 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <Hash size={18} className="text-orange-500" /> Options Chain — {expiry}
              </h2>
              <span className="text-[10px] font-black text-[#5c4030] uppercase">Spot: ${spot?.toLocaleString()}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="text-[9px] uppercase tracking-widest text-[#5c4030] font-black border-b border-[#1c1000]">
                    <th className="px-4 py-4">Calls (Vol/Delta)</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4 text-white bg-orange-500/5">Strike</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Puts (Vol/Delta)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1000]">
                  {calls.map((c, i) => {
                    const p = puts[i]
                    return (
                      <tr key={c.strike} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedStrike(c)}>
                        <td className="px-4 py-4">
                          <div className="flex justify-center items-center gap-3">
                            <span className="text-[10px] font-bold text-[#a18266] opacity-50">{c.volume}</span>
                            <span className="text-xs font-black text-green-500">{c.delta}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-white font-black text-sm">${c.ask.toLocaleString()}</td>
                        <td className="px-4 py-4 bg-orange-500/5 border-x border-[#1c1000]">
                          <span className={`text-base font-black ${Math.abs(c.strike - spot) < 1000 ? 'text-orange-500' : 'text-white'}`}>
                            ${c.strike.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-white font-black text-sm">${p?.ask.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center items-center gap-3">
                            <span className="text-xs font-black text-red-500">{p?.delta}</span>
                            <span className="text-[10px] font-bold text-[#a18266] opacity-50">{p?.volume}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Analytics & Payoff */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#120a00] border border-[#1c1000] rounded-[32px] p-6 h-full flex flex-col">
            <h2 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <Brain size={18} className="text-orange-500" /> Strategy Payoff Simulator
            </h2>
            
            <AnimatePresence mode="wait">
              {selectedStrike ? (
                <motion.div 
                  key="payoff"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{selectedStrike.type.toUpperCase()} Strategy</p>
                    <h3 className="text-white font-black text-xl tracking-tighter">${selectedStrike.strike} Strike</h3>
                  </div>

                  <div className="flex-1 min-h-[200px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={payoffData}>
                        <defs>
                          <linearGradient id="payoffGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1c1000" vertical={false} />
                        <XAxis dataKey="price" hide />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ background: '#120a00', border: '1px solid #3d2700', borderRadius: '12px' }}
                          labelStyle={{ color: '#7c5a40', fontWeight: 'bold' }}
                        />
                        <ReferenceLine y={0} stroke="#3d2700" strokeWidth={2} />
                        <Area type="monotone" dataKey="pnl" stroke="#f97316" fillOpacity={1} fill="url(#payoffGradient)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <button className="w-full bg-orange-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-white transition-all shadow-xl">
                    Execute in Hub
                  </button>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#1c1000] rounded-3xl">
                  <div className="bg-[#1c1000] p-4 rounded-2xl mb-4">
                    <Activity className="text-orange-500" size={32} />
                  </div>
                  <h3 className="text-white font-black uppercase text-xs mb-2">Simulation Engine Idle</h3>
                  <p className="text-[#5c4030] text-[10px] font-bold">Select a strike from the chain to simulate the PnL payoff curve and Greeks sensitivity.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
