import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Cpu, Zap, Search, Activity, Signal, 
  Bell, Bot, TrendingUp, TrendingDown, Eye,
  BarChart3, Globe, Bitcoin, Landmark, Info,
  ArrowUpRight, ArrowDownRight, Compass
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Intelligence() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All Signals')

  const setups = [
    {
      id: 1,
      symbol: 'BTC/USD',
      pattern: 'Ascending Triangle',
      side: 'BULLISH',
      confidence: 94,
      trendStrength: 4,
      resistance: '$65,800.00',
      support: '$62,000.00',
      explanation: 'Clear breakout confirmation on the 4H timeframe. Target localized at $68,500 with high volume support.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzlG-9g0XZiIrPRt-Q2HoX1DFEx6t-H3Gq4mRn334mmgRMCKZRGDGDpaXOWmszJZGNSA-L99O8-fmu_n-smtEpU8NApOiCjwj2AJKoqgBUYM-MY-MHYkPSjFQX4IWyG7VtlPOvYix-Krdgqx-5duY5_gFUjF1Fg8bYDcYT4RxqmPw-_0x1pNflbfaAbkAtHKxVJLhZS6yHOjQEmrRHtcbctNTc-HQCZ9ILs3C_fpqcni9c6T-mLJkqiPCyNIWEDBOnpZMU82uFK_Gh"
    },
    {
      id: 2,
      symbol: 'EUR/USD',
      pattern: 'Double Top Rejection',
      side: 'BEARISH',
      confidence: 87,
      trendStrength: 3,
      resistance: '1.0924',
      support: '1.0810',
      explanation: 'AI detects selling pressure at key psychological 1.09 level. Stochastic RSI showing overbought signals.',
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5KGuu9T1yXc7Si32fUMq5HLkOK5DWu8eQi_bBX9OpC_EVK1XSGXilkZ8Fd4Cw1hrRTFvY6enr71Z-qKA1cTuOfKxemmhh96EAZHsyoJWYH-breUAOGVSul38TEXwefXEWu-_hb6fi91YXC-TM7abDjHkODbhFiL-c0bl1jOfRKF0JKb7kT0_1I2vG5MbwlBWoO1P4PCwEFbMcyIFp3jvPSyNYYxqdkoRG5ctB78OHBI0FCzYNbpjA1CrzX6P7bOYP5SXcOK1bQgBl"
    }
  ]

  return (
    <div className="space-y-8 font-['Inter']">
      
      {/* Dynamic Action Banner */}
      <section>
        <div className="p-8 rounded-[2.5rem] bg-[#121212] border border-white/5 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-[2rem] bg-[var(--orange-primary)] flex items-center justify-center shrink-0 shadow-2xl shadow-[var(--orange-primary)]/20 transition-all duration-700">
              <Bot size={40} className="text-black" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[var(--orange-primary)]" />
                 <span className="text-[10px] font-bold text-[var(--orange-primary)] uppercase tracking-widest leading-none">AI Market Intelligence</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Market Analyst Alpha</h2>
              <p className="text-zinc-500 text-sm max-w-xl">"Market projections identify high-probability setups across asset classes. How can I assist your trading strategy today?"</p>
            </div>
            <button className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-zinc-200 transition-all active:scale-[0.98]">
               View Intelligence
            </button>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Globe size={120} strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* Intelligence Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl w-full md:w-auto">
          {['All Signals', 'Forex', 'Crypto', 'Stocks'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'text-white bg-white/10 shadow-lg' 
                : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Confidence Threshold</span>
           <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--orange-primary)] rounded-full" style={{ width: '85%' }} />
           </div>
           <span className="text-[10px] font-bold text-white uppercase tracking-widest">85%+</span>
        </div>
      </div>

      <main className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {setups.map((setup, idx) => (
            <motion.div 
              key={setup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group rounded-[2.5rem] border border-white/5 bg-[#121212] flex flex-col overflow-hidden hover:border-white/10 transition-all shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                 <img src={setup.image} alt={setup.symbol} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                 <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-2xl ${
                   setup.side === 'BULLISH' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                 }`}>
                   {setup.side}
                 </div>
              </div>

              <div className="p-10 space-y-8">
                 <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight mb-2">{setup.symbol} Signal</h3>
                      <div className="flex items-center gap-2">
                        <Compass size={14} className="text-[var(--orange-primary)]" />
                        <span className="text-zinc-500 text-xs font-medium italic">{setup.pattern} detected</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-bold text-white tracking-tight">{setup.confidence}%</p>
                       <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">AI Confidence</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                    <div className="space-y-1">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Resistance</p>
                      <p className="text-xl font-bold text-white">{setup.resistance}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Support</p>
                      <p className="text-xl font-bold text-zinc-400">{setup.support}</p>
                    </div>
                 </div>

                 <p className="text-zinc-500 text-sm leading-relaxed">
                   {setup.explanation}
                 </p>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => navigate('/execution')}
                      className="flex-1 bg-[var(--orange-primary)] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[var(--orange-primary)]/10 hover:shadow-[var(--orange-primary)]/20 active:scale-98"
                    >
                      <Zap size={18} strokeWidth={3} />
                      <span className="text-xs uppercase tracking-widest">Execute Trade</span>
                    </button>
                    <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                      <Info size={20} />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

    </div>
  )
}
