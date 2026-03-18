import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Globe, Trophy, Users, TrendingUp, Copy, CheckCircle2, 
  ChevronRight, Zap, Star, Activity, Crown, Search, Filter,
  ArrowUpRight, ArrowDownRight, Share2, Info
} from 'lucide-react'
import api from '../services/api'

export default function Social() {
  const [activeTab, setActiveTab] = useState('leaderboard') // leaderboard | marketplace
  const [subscribingTo, setSubscribingTo] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [marketplace, setMarketplace] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'leaderboard') {
        const data = await api.social.getLeaderboard()
        setLeaderboard(data)
      } else {
        const data = await api.social.getMarketplace()
        setMarketplace(data)
      }
    } catch (err) {
      console.error("Social data fetch failed", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = (id) => {
    setSubscribingTo(id)
    setTimeout(() => {
      setSubscribingTo(null)
    }, 1500)
  }

  return (
    <div className="space-y-10 font-['Inter']">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Social Feed</h2>
          <h1 className="text-4xl font-bold tracking-tight">Copy Trading</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-xl">
            Track top-performing traders and automatically synchronize premium algorithmic strategies with your portfolio.
          </p>
        </div>
        
        <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl w-full md:w-auto">
          {['leaderboard', 'marketplace'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'text-black bg-[var(--orange-primary)] shadow-lg shadow-[var(--orange-primary)]/20' 
                : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab === 'leaderboard' ? 'Top Traders' : 'Strategy Market'}
            </button>
          ))}
        </div>
      </div>

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'leaderboard' ? (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-24 w-full rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
                  ))
                ) : leaderboard.map((trader, idx) => (
                  <div 
                    key={trader.rank}
                    className="p-6 rounded-[2rem] border border-white/5 bg-[#121212] hover:bg-white/[0.02] transition-all group flex items-center gap-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                       <span className={`text-2xl font-bold ${idx < 3 ? 'text-[var(--orange-primary)]' : 'text-zinc-600'}`}>
                         {trader.rank}
                       </span>
                       <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Rank</span>
                       {idx === 0 && <div className="absolute top-0 right-0 w-4 h-4 bg-[var(--orange-primary)] flex items-center justify-center -rotate-45 translate-x-1.5 -translate-y-1.5 shadow-xl" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg tracking-tight">{trader.name}</h4>
                        <CheckCircle2 size={14} className="text-blue-500" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          <Users size={12} strokeWidth={3} /> {trader.followers.toLocaleString()} Copiers
                        </div>
                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                          trader.risk === 'Low' ? 'text-emerald-500 bg-emerald-500/10' : trader.risk === 'High' ? 'text-rose-500 bg-rose-500/10' : 'text-[var(--orange-primary)] bg-[var(--orange-primary)]/10'
                        }`}>
                          Risk: {trader.risk}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block w-32">
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500/40 rounded-full" style={{ width: '70%' }} />
                       </div>
                       <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-2">Win Consistency</p>
                    </div>

                    <div className="text-right">
                       <p className="text-emerald-500 text-2xl font-bold tracking-tight">{trader.return}</p>
                       <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">30D ROI</p>
                    </div>

                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-[var(--orange-primary)] group-hover:border-transparent transition-all">
                       <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="marketplace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-64 w-full rounded-[2.5rem] bg-white/5 border border-white/5 animate-pulse" />
                ))
              ) : marketplace.map((strat, idx) => (
                <div 
                  key={idx}
                  className="rounded-[2.5rem] border border-white/5 bg-[#121212] p-10 flex flex-col gap-8 relative group hover:border-white/10 transition-all shadow-xl overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-5 items-center">
                       <div className="w-14 h-14 rounded-2xl bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] flex items-center justify-center">
                          <Zap size={24} strokeWidth={3} />
                       </div>
                       <div>
                         <h4 className="text-xl font-bold tracking-tight">{strat.name}</h4>
                         <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Author: {strat.author}</p>
                       </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-bold">
                      {strat.cost}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 py-8 border-y border-white/5">
                    <div className="space-y-1">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Est. APY</p>
                      <p className="text-2xl font-bold text-emerald-500">{strat.apy}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Win Rate</p>
                      <p className="text-2xl font-bold text-white">{strat.winRate}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Drawdown</p>
                      <p className="text-2xl font-bold text-rose-500">{strat.dd}</p>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
                    {strat.description}
                  </p>

                  <button 
                    onClick={() => handleSubscribe(strat.id)}
                    className="w-full bg-white text-black hover:bg-zinc-200 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {subscribingTo === strat.id ? (
                      <Activity size={18} className="animate-spin" />
                    ) : (
                      <><Copy size={18} /> Deploy Strategy</>
                    )}
                  </button>

                  {/* Decorative Subtle Background */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
