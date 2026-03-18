import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, TrendingUp, TrendingDown, Activity, Zap,
  LineChart, CandlestickChart, Brain, Bell, Signal
} from 'lucide-react'
import api from '../services/api'
import TradingChart from '../components/charts/TradingChart'
import StockCard from '../components/market/StockCard'

const WATCHLIST = [
  { s: 'BTC', n: 'Bitcoin', cat: 'Crypto' },
  { s: 'ETH', n: 'Ethereum', cat: 'Crypto' },
  { s: 'SOL', n: 'Solana', cat: 'Crypto' },
  { s: 'NVDA', n: 'NVIDIA Corp.', cat: 'Stocks' },
  { s: 'AAPL', n: 'Apple Inc.', cat: 'Stocks' },
  { s: 'EURUSD', n: 'Euro/USD', cat: 'Forex' },
]

const AI_SETUPS = [
  { icon: '🔼', symbol: 'BTC', setup: 'Bullish Divergence on RSI (D1)', confidence: 87, type: 'buy' },
  { icon: '📊', symbol: 'NVDA', setup: 'MACD Bullish Cross confirmed', confidence: 79, type: 'buy' },
  { icon: '⚠️', symbol: 'ETH', setup: 'Volume spike — possible reversal', confidence: 62, type: 'neutral' },
  { icon: '🔽', symbol: 'EURUSD', setup: 'EMA 50 resistance — short bias', confidence: 71, type: 'sell' },
]

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W']
const CHART_TYPES = [
  { id: 'candlestick', label: 'Candles', Icon: CandlestickChart },
  { id: 'line', label: 'Line', Icon: LineChart },
]

export default function Markets() {
  const [assets, setAssets] = useState([])
  const [sentiment, setSentiment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(WATCHLIST[0])
  const [tf, setTf] = useState('1D')
  const [chartType, setChartType] = useState('candlestick')
  const [showRSI, setShowRSI] = useState(true)
  const [showMACD, setShowMACD] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [priceData, sentimentData] = await Promise.all([
          api.market.getPrices(),
          api.market.getSentiment()
        ])
        if (priceData) {
          const enhanced = priceData.map(a => ({
            ...a,
            s: a.symbol,
            n: WATCHLIST.find(w => w.s === a.symbol)?.n || a.symbol,
            p: `$${a.price.toLocaleString()}`,
            c: `${a.change >= 0 ? '+' : ''}${a.change}%`,
            pos: a.change >= 0,
          }))
          setAssets(enhanced)
        }
        if (sentimentData) setSentiment(sentimentData)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const getAssetData = (sym) => assets.find(a => a.s === sym)
  const filtered = search ? WATCHLIST.filter(w =>
    w.s.toLowerCase().includes(search.toLowerCase()) ||
    w.n.toLowerCase().includes(search.toLowerCase())
  ) : WATCHLIST

  return (
    <div className="relative h-[calc(100vh-130px)] overflow-hidden">
      {/* Mesh Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1], 
            rotate: [0, 20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-30%] right-[-20%] w-[100%] h-[100%] bg-[var(--orange-primary)]/5 blur-[100px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay" />
      </div>

      <div className="flex-1 flex flex-col gap-6 min-w-0 p-6 overflow-hidden">
        
        {/* Real-time Alpha Vantage Strip */}
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar relative z-20 flex-shrink-0">
          <StockCard symbol="RELIANCE.BSE" name="Reliance Industries" />
          <StockCard symbol="TCS.BSE" name="Tata Consultancy" />
          <StockCard symbol="INFY.BSE" name="Infosys Limited" />
          <StockCard symbol="HDFCBANK.BSE" name="HDFC Bank" />
          <StockCard symbol="ICICIBANK.BSE" name="ICICI Bank" />
        </div>

        <div className="relative z-10 flex h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-hidden">

        {/* ── Left: Market Watchlist ── */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-6 overflow-hidden">
          
          {/* Header & Search */}
          <div className="px-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="h-[1px] w-4 bg-[var(--orange-primary)]/50" />
                <h2 className="text-[var(--orange-primary)] text-[9px] font-bold uppercase tracking-[0.4em]">Market Watchlist</h2>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search markets..."
                  className="w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all placeholder:text-zinc-700 uppercase tracking-widest"
                />
              </div>
          </div>

          {/* Sentiment Glass Card */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Zap size={80} className="text-white" />
            </div>
            <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-[0.3em] mb-4">Market Sentiment Analysis</p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Signal className="text-[var(--green-profit)] shadow-[0_0_10px_var(--green-profit)]" size={14} />
                <span className="text-white font-bold text-sm uppercase tracking-tighter">{sentiment?.overall || 'NEUTRAL'}</span>
              </div>
              <span className="text-[var(--orange-primary)] font-bold text-sm">{sentiment?.confidence || 84}% <span className="text-[10px] opacity-40">CONF</span></span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden p-[0.5px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sentiment?.confidence || 84}%` }}
                className="h-full bg-gradient-to-r from-[var(--green-profit)] to-[var(--orange-primary)] rounded-full shadow-[0_0_10px_rgba(255,145,0,0.3)]" 
              />
            </div>
          </div>

          {/* Asset List Matrix */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map(w => {
              const d = getAssetData(w.s)
              const pos = d ? d.pos : true
              const isSelected = selected.s === w.s
              return (
                <motion.button
                  key={w.s}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(w)}
                  className={`relative w-full flex items-center justify-between px-5 py-5 rounded-[2rem] border transition-all duration-500 overflow-hidden group/item shadow-lg ${isSelected
                    ? 'bg-white/[0.08] border-white/20 shadow-white/5'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="active-nav-glow"
                      className="absolute inset-0 bg-gradient-to-r from-[var(--orange-primary)]/10 to-transparent opacity-50"
                    />
                  )}
                  <div className="relative z-10">
                    <div className="text-base font-black text-white italic tracking-tighter leading-none">{w.s}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1.5">{w.cat}</div>
                  </div>
                  <div className="relative z-10 text-right">
                    <div className="text-sm font-black text-white italic tracking-tight">{d?.p || 'FETCHING...'}</div>
                    <div className={`text-[10px] font-black mt-1 ${pos ? 'text-[var(--green-profit)]' : 'text-[var(--red-loss)]'} italic`}>
                       {d?.c || 'SYNCING'}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Center: Precision Charting ── */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Dynamic Asset Header */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between flex-wrap gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <Activity size={120} className="text-white" />
            </div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-black/40 border-2 border-[var(--orange-primary)]/20 flex items-center justify-center text-[var(--orange-primary)] font-black text-2xl shadow-inner italic">
                {selected.s[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-white font-black text-3xl italic tracking-tighter leading-none">{selected.s}/USDT</h1>
                    <span className="bg-white/5 px-3 py-1 rounded-full text-[9px] font-black text-white/40 border border-white/5 uppercase tracking-[0.2em] italic">Live Stream</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] mt-2 italic">{selected.n} / GLOBAL INDEX</div>
              </div>
              {(() => {
                const d = getAssetData(selected.s)
                return d ? (
                  <div className="flex items-center gap-6 ml-6 border-l border-white/5 pl-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1 italic">Current Mark</span>
                        <span className="text-white font-black text-3xl italic tracking-tighter leading-none">${d.p.replace('$','')}</span>
                    </div>
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`flex flex-col items-end px-5 py-2 rounded-2xl border ${d.pos ? 'bg-[var(--green-profit)]/10 border-[var(--green-profit)]/20 text-[var(--green-profit)]' : 'bg-[var(--red-loss)]/10 border-[var(--red-loss)]/20 text-[var(--red-loss)]'}`}
                    >
                         <span className="text-[18px] font-black italic leading-none">{d.c}</span>
                         <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">Volatility Vector</span>
                    </motion.div>
                  </div>
                ) : null
              })()}
            </div>

            {/* Precision Controls */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1.5 shadow-2xl">
                {CHART_TYPES.map(ct => (
                  <button
                    key={ct.id}
                    onClick={() => setChartType(ct.id)}
                    className={`px-5 py-3 rounded-[1rem] flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 italic ${chartType === ct.id ? 'bg-[var(--orange-primary)] text-black shadow-lg shadow-[var(--orange-primary)]/20' : 'text-[var(--text-muted)] hover:text-white'}`}
                  >
                    <ct.Icon size={14} /> {ct.label}
                  </button>
                ))}
              </div>
              
              <div className="h-10 w-[1px] bg-white/5" />

              <div className="flex gap-2">
                <button onClick={() => setShowRSI(v => !v)} className={`px-5 py-3 rounded-2xl text-[10px] font-black border transition-all duration-500 uppercase italic tracking-widest ${showRSI ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' : 'bg-transparent border-white/5 text-[var(--text-muted)] hover:border-white/20'}`}>RSI</button>
                <button onClick={() => setShowMACD(v => !v)} className={`px-5 py-3 rounded-2xl text-[10px] font-black border transition-all duration-500 uppercase italic tracking-widest ${showMACD ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-transparent border-white/5 text-[var(--text-muted)] hover:border-white/20'}`}>MACD</button>
                <div className="relative group">
                    <button className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-[var(--orange-primary)] hover:border-[var(--orange-primary)]/30 transition-all duration-500">
                        <Bell size={18} />
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* Time-frame Ribbon */}
          <div className="flex gap-2 px-1">
            {TIMEFRAMES.map(t => (
              <button
                key={t}
                onClick={() => setTf(t)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 italic ${tf === t ? 'bg-[var(--orange-primary)] text-black shadow-lg shadow-[var(--orange-primary)]/20' : 'bg-white/5 border border-white/5 text-[var(--text-muted)] hover:text-white hover:border-white/20'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Institutional Engine Chart */}
          <div className="backdrop-blur-3xl bg-black/40 border border-white/10 rounded-[3rem] overflow-hidden flex-1 shadow-2xl group/chart">
            <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />
            <div className="h-full w-full opacity-90 group-hover/chart:opacity-100 transition-opacity duration-700">
                <TradingChart 
                    key={`${selected.s}-${chartType}-${showRSI}-${showMACD}`} 
                    symbol={selected.s} 
                    type={chartType} 
                    showRSI={showRSI} 
                    showMACD={showMACD} 
                />
            </div>
          </div>
        </div>

        {/* ── Right: AI Intelligence Panel ── */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-6 overflow-hidden">
          
          {/* AI Setups Glass Card */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl flex-1">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/40 border border-[var(--orange-primary)]/20 rounded-xl flex items-center justify-center">
                        <Brain className="text-[var(--orange-primary)]" size={20} />
                    </div>
                    <span className="text-white font-black text-sm uppercase tracking-[0.2em] italic">AI Signal Feed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[var(--green-profit)] rounded-full animate-pulse" />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-white/5">
                {AI_SETUPS.map((setup, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 hover:bg-white/5 transition-all duration-500 cursor-crosshair group/setup"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col items-center gap-1">
                         <span className="text-2xl group-hover/setup:scale-125 transition-transform duration-500">{setup.icon}</span>
                         <span className={`text-[8px] font-black px-2 mt-1 py-0.5 rounded-full uppercase tracking-tighter ${
                            setup.type === 'buy' ? 'bg-[var(--green-profit)]/10 text-[var(--green-profit)]' :
                            setup.type === 'sell' ? 'bg-[var(--red-loss)]/10 text-[var(--red-loss)]' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>{setup.type}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-white font-black text-sm italic tracking-tight">{setup.symbol} VECTOR</span>
                          <span className="text-[10px] font-black text-[var(--orange-primary)] italic">{setup.confidence}% <span className="text-[8px] opacity-40 uppercase">Conf</span></span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] font-bold italic leading-relaxed">"{setup.setup}"</p>
                      </div>
                    </div>
                    {/* Confidence bar */}
                    <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden p-[0.5px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${setup.confidence}%` }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                        className={`h-full rounded-full ${setup.type === 'buy' ? 'bg-[var(--green-profit)]' : setup.type === 'sell' ? 'bg-[var(--red-loss)]' : 'bg-yellow-500'}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicator Pulse Glass Card */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl group">
             <div className="flex items-center gap-3 mb-6 px-1">
                <Activity className="text-blue-400" size={16} />
                <span className="text-white font-black text-xs uppercase tracking-[0.3em] italic group-hover:tracking-[0.4em] transition-all">Sensor Matrix</span>
             </div>
             <div className="space-y-4">
               {[
                 { name: 'RSI OSCILLATOR', value: '63.4', signal: 'WAIT', color: 'text-yellow-500' },
                 { name: 'MACD HISTOGRAM', value: '+0.0024', signal: 'BULLISH', color: 'text-[var(--green-profit)]' },
                 { name: 'EMA 200 ANCHOR', value: 'ABOVE', signal: 'SECURE', color: 'text-[var(--green-profit)]' },
                 { name: 'VOLUME VELOCITY', value: 'HIGH', signal: 'ELEVATED', color: 'text-[var(--orange-primary)]' },
               ].map(ind => (
                 <div key={ind.name} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                    <span className="text-[8px] text-white/30 font-black uppercase tracking-widest italic">{ind.name}</span>
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-black text-white italic tracking-tighter leading-none">{ind.value}</span>
                        <span className={`text-[9px] font-black uppercase italic tracking-widest ${ind.color} opacity-80 shadow-[0_0_10px_currentColor]`}>{ind.signal}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
        </div>
      </div>
    </div>
  )
}
