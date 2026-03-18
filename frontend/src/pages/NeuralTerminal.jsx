import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Bell, Star, TrendingUp,
  Rocket, Terminal, BarChart3, Zap, User,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  TrendingDown, Activity, Info, Settings,
  Maximize2, Share2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NeuralTerminal() {
  const navigate = useNavigate()
  const [activeTimeframe, setActiveTimeframe] = useState('1H')

  const newsItems = [
    {
      id: 1,
      type: 'BULLISH',
      time: '2m ago',
      content: 'Institutional accumulation detected in major spot ETFs as BTC stabilizes above support.',
      source: 'BLOOMBERG',
      confidence: '92%'
    },
    {
      id: 2,
      type: 'BEARISH',
      time: '14m ago',
      content: 'Regulatory headwinds increase as new oversight proposals emerge for offshore exchanges.',
      source: 'REUTERS',
      confidence: '78%'
    },
    {
      id: 3,
      type: 'BULLISH',
      time: '32m ago',
      content: 'Hashrate hits new all-time high as network security reaches unprecedented levels.',
      source: 'ON-CHAIN',
      confidence: '99%'
    }
  ]

  return (
    <div className="space-y-8 font-['Inter'] pb-40">
      
      {/* Trading Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h1 className="text-3xl font-bold tracking-tight">BTC / USDT</h1>
               <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Live</div>
            </div>
            <p className="text-zinc-500 text-xs font-medium tracking-wide italic">Neural Execution Cluster 01</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex-1 md:flex-none p-6 rounded-[1.5rem] bg-[#121212] border border-white/5 flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">Current Price</span>
              <span className="text-xl font-bold text-white tracking-tighter">$64,281.50</span>
           </div>
           <div className="flex-1 md:flex-none p-6 rounded-[1.5rem] bg-[#121212] border border-white/5 flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">24h Change</span>
              <span className="text-xl font-bold text-emerald-500 tracking-tighter">+1.24%</span>
           </div>
        </div>
      </div>

      <main className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Chart Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] bg-[#121212] border border-white/5 p-8 relative overflow-hidden group shadow-2xl">
            <div className="flex justify-between items-center mb-8 relative z-10">
               <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-xl">
                 {['1H', '4H', '1D', '1W'].map(tf => (
                   <button 
                     key={tf}
                     onClick={() => setActiveTimeframe(tf)}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                       activeTimeframe === tf ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                     }`}
                   >
                     {tf}
                   </button>
                 ))}
               </div>
               <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                     <Settings size={16} />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                     <Maximize2 size={16} />
                  </button>
               </div>
            </div>

            {/* Professional Grid Pattern */}
            <div className="h-[400px] w-full relative chart-grid opacity-30 pointer-events-none" />
            
            <div className="absolute inset-0 top-32 left-8 right-16 bottom-8 flex items-end justify-between px-8">
               {[40, 60, 45, 75, 55, 90, 70, 85, 65, 80].map((h, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 group/candle">
                    <div className="w-[2px] h-32 bg-white/5 relative flex flex-col justify-end">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${h}%` }}
                         className={`w-6 -ml-[11px] rounded-sm shadow-xl transition-all ${
                           h > 50 ? 'bg-emerald-500/40 border border-emerald-500/20' : 'bg-rose-500/40 border border-rose-500/20'
                         }`}
                       />
                    </div>
                 </div>
               ))}
               <div className="absolute inset-0 flex items-center pointer-events-none">
                  <div className="w-full h-[1px] bg-[var(--orange-primary)]/20 border-t border-dashed border-[var(--orange-primary)]/40 relative">
                     <div className="absolute right-0 -top-2.5 bg-[var(--orange-primary)] text-black px-2 py-0.5 text-[8px] font-bold rounded">64.2K</div>
                  </div>
               </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 px-12 flex justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] opacity-50">
               <span>1.2B VOL</span>
               <span>NEURAL_RSI: 64.2</span>
               <span>VOLATILITY: LOW</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 rounded-[2.5rem] bg-[#121212] border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-zinc-400">
                   <Activity size={18} strokeWidth={2.5} />
                   <h3 className="text-xs font-bold uppercase tracking-widest">Market Depth</h3>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      <span>Bids</span>
                      <span>Asks</span>
                   </div>
                   <div className="flex gap-2 h-4 items-center">
                      <div className="flex-[0.7] h-full bg-emerald-500/20 border-r-2 border-emerald-500/50 rounded-sm" />
                      <div className="flex-[0.3] h-full bg-rose-500/20 border-l-2 border-rose-500/50 rounded-sm" />
                   </div>
                   <p className="text-[9px] text-zinc-500 text-center font-medium italic">Buy pressure dominated with 74.2% skew</p>
                </div>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-[#121212] border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-zinc-400">
                   <Zap size={18} strokeWidth={2.5} />
                   <h3 className="text-xs font-bold uppercase tracking-widest">Neural Signal</h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-3xl font-bold tracking-tight text-[var(--orange-primary)]">Strong Buy</div>
                   <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--orange-primary)] w-[92%] shadow-[0_0_15px_var(--orange-primary)]/20" />
                   </div>
                   <span className="text-xs font-bold text-white">92%</span>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar / Intel Feed */}
        <div className="space-y-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Intelligence Feed</h3>
              <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_emerald-500]" />
           </div>

           <div className="space-y-4">
              {newsItems.map((item, idx) => (
                <div 
                  key={item.id}
                  className="p-6 rounded-3xl border border-white/5 bg-[#121212] hover:bg-white/5 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-bold tracking-widest uppercase ${item.type === 'BULLISH' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.type}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{item.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium group-hover:text-white transition-colors">{item.content}</p>
                  <div className="mt-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Share2 size={12} className="text-zinc-600 hover:text-white cursor-pointer" />
                        <Info size={12} className="text-zinc-600 hover:text-white cursor-pointer" />
                     </div>
                     <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest italic">{item.source} HUB</span>
                  </div>
                </div>
              ))}
           </div>
           
           <button className="w-full py-4 rounded-2xl border border-white/5 text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] hover:bg-white/5 transition-all">
              Load Archive Data
           </button>
        </div>

      </main>

      {/* Execution Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-width)] p-8 bg-[#121212]/90 backdrop-blur-3xl border-t border-white/5 z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-center">
           <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <button className="flex flex-col items-center justify-center p-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-3xl transition-all active:scale-[0.98] shadow-2xl shadow-emerald-500/10">
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-1">Market Order</span>
                 <span className="text-2xl font-bold tracking-tight uppercase">Buy / Long</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-rose-500 hover:bg-rose-400 text-white rounded-3xl transition-all active:scale-[0.98] shadow-2xl shadow-rose-500/10">
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-1">Market Order</span>
                 <span className="text-2xl font-bold tracking-tight uppercase">Sell / Short</span>
              </button>
           </div>
           
           <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Available Balance</span>
              <span className="text-xl font-bold text-white tabular-nums">$1,240,582.00</span>
           </div>
        </div>
      </div>

    </div>
  )
}
