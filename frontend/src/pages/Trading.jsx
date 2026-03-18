import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle } from 'lucide-react'
import api from '../services/api'
import TradingChart from '../components/charts/TradingChart'
import Watchlist from '../components/Watchlist'

export default function Trading() {
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [positions, setPositions] = useState([])
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [signal, setSignal] = useState(null)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [posData, priceData] = await Promise.all([
          api.portfolio.getPositions(),
          api.market.getPrices()
        ])
        if (posData) setPositions(posData)
        if (priceData) setPrices(priceData)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchSignal() {
      try {
        const data = await api.market.getSignal(selectedSymbol)
        setSignal(data)
      } catch (err) {
        console.error("Signal fetch error:", err)
      }
    }
    fetchSignal()
  }, [selectedSymbol])

  const handlePlaceOrder = async () => {
    try {
      const accounts = await api.broker.getAccounts()
      if (accounts.length === 0) {
        alert("Please connect a broker account first!")
        return
      }
      
      const res = await api.broker.placeOrder({
        symbol: selectedSymbol,
        quantity: parseInt(amount) || 1,
        side: side.toUpperCase(),
        type: orderType.toUpperCase(),
        broker_id: accounts[0].id
      })
      alert("Order Placed: " + JSON.stringify(res))
    } catch (err) {
      alert("Order Failed: " + err.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* Sidebar: Watchlist */}
      <div className="lg:col-span-3 space-y-6">
        <Watchlist onSelectSymbol={setSelectedSymbol} />
        
        {/* AI Insight Sidebar */}
        {signal && (
          <div className="card border-t-4 border-t-[var(--orange-primary)] bg-black/40 p-5 group hover:border-[var(--orange-primary)] transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.2em]">Intel Core</div>
               <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${signal.signal === 'BUY' ? 'bg-[var(--green-profit)]/10 text-[var(--green-profit)]' : signal.signal === 'SELL' ? 'bg-[var(--red-loss)]/10 text-[var(--red-loss)]' : 'bg-white/10 text-white'}`}>
                 {signal.signal}
               </div>
            </div>
            <div className="text-white font-black text-xs leading-relaxed italic opacity-80 mb-2">"{signal.reason}"</div>
            <div className="flex items-center gap-2 text-[8px] font-black text-[var(--orange-primary)] uppercase tracking-tighter">
               <TrendingUp size={10} /> AI SENTIMENT ANALYSIS
            </div>
          </div>
        )}

        {/* Quick Stats Sidebar */}
        <div className="card text-center py-6 group hover:border-[var(--orange-primary)] transition-all">
          <div className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.2em] mb-2">Available Margin</div>
          <div className="text-white font-black text-xl font-space">$42,500.00</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 space-y-6">
        {/* Chart Section */}
        <div className="card !p-0 overflow-hidden border-t-4 border-t-[var(--orange-primary)] shadow-2xl shadow-[var(--orange-primary)]/5">
          <div className="p-4 border-b border-[var(--border-color)] bg-black/20 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-white font-black text-lg tracking-tighter italic uppercase">{selectedSymbol}/USDT</span>
              <span className="text-[var(--green-profit)] text-xs font-black tracking-widest">+1.24%</span>
            </div>
            <div className="flex gap-2">
               {['1M', '5M', '15M', '1H', '1D'].map(tf => (
                 <button key={tf} className="px-3 py-1 rounded-lg text-[9px] font-black text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all">{tf}</button>
               ))}
            </div>
          </div>
          <TradingChart symbol={selectedSymbol} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
           {/* Order Panel */}
           <div className="xl:col-span-5 space-y-6">
             <div className="card">
               <div className="flex gap-2 p-1 bg-black/40 rounded-2xl mb-6 shadow-inner">
                 <button 
                   onClick={() => setSide('buy')}
                   className={`flex-1 py-4 rounded-xl font-black transition-all ${side === 'buy' ? 'bg-[var(--green-profit)] text-black shadow-lg shadow-[var(--green-profit)]/20' : 'text-[var(--text-muted)] hover:text-white'}`}
                 >BUY</button>
                 <button 
                   onClick={() => setSide('sell')}
                   className={`flex-1 py-4 rounded-xl font-black transition-all ${side === 'sell' ? 'bg-[var(--red-loss)] text-black shadow-lg shadow-[var(--red-loss)]/20' : 'text-[var(--text-muted)] hover:text-white'}`}
                 >SELL</button>
               </div>

               <div className="flex justify-between border-b border-[var(--border-color)] mb-6">
                 {['market', 'limit', 'stop'].map(t => (
                   <button key={t} onClick={() => setOrderType(t)}
                     className={`pb-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${orderType === t ? 'text-[var(--orange-primary)] border-b-2 border-[var(--orange-primary)]' : 'text-[var(--text-muted)] hover:text-white'}`}>
                     {t}
                   </button>
                 ))}
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.2em] mb-2 block">Amount (Units)</label>
                   <div className="relative group">
                     <input 
                       type="number" 
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       placeholder="0.00" 
                       className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl py-5 px-6 text-white font-black outline-none focus:border-[var(--orange-primary)] transition-all text-2xl group-hover:bg-black/60 shadow-inner" 
                     />
                     <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-black text-xs">UNIT</span>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[var(--green-profit)] text-[9px] font-black uppercase tracking-[0.2em] mb-2 block">Take Profit</label>
                     <input type="number" placeholder="None" className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl py-4 px-4 text-white font-black outline-none focus:border-[var(--green-profit)] hover:bg-black/60 transition-all" />
                   </div>
                   <div>
                     <label className="text-[var(--red-loss)] text-[9px] font-black uppercase tracking-[0.2em] mb-2 block">Stop Loss</label>
                     <input type="number" placeholder="None" className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl py-4 px-4 text-white font-black outline-none focus:border-[var(--red-loss)] hover:bg-black/60 transition-all" />
                   </div>
                 </div>

                 <button 
                   onClick={handlePlaceOrder}
                   className={`w-full py-6 rounded-2xl font-black text-xl transition-all transform active:scale-95 shadow-2xl mt-4 ${side === 'buy' ? 'bg-[var(--green-profit)] shadow-[var(--green-profit)]/30 text-black' : 'bg-[var(--red-loss)] shadow-[var(--red-loss)]/30 text-black'}`}>
                   PLACE {side === 'buy' ? 'BUY' : 'SELL'} ORDER
                 </button>
               </div>
             </div>
           </div>

           {/* Trade Journal */}
           <div className="xl:col-span-7">
             <div className="card h-full flex flex-col">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-white font-black text-xl italic uppercase font-space tracking-tighter">Trade Journal</h2>
                 <div className="flex gap-2 p-1 bg-black/30 rounded-xl border border-[var(--border-color)]">
                   <button className="px-4 py-1.5 rounded-lg bg-[var(--orange-primary)] text-black text-[9px] font-black uppercase">Open</button>
                   <button className="px-4 py-1.5 rounded-lg text-[var(--text-muted)] text-[9px] font-black uppercase">History</button>
                 </div>
               </div>

               <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                 {positions.map((t) => (
                   <div key={t.symbol} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-black/20 hover:bg-black/40 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                       <div className={`w-1 h-10 rounded-full ${t.pnl >= 0 ? 'bg-[var(--green-profit)]' : 'bg-[var(--red-loss)]'}`} />
                       <div>
                         <div className="flex items-center gap-2 mb-0.5">
                           <span className="text-white font-black text-sm">{t.symbol}</span>
                           <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${t.type === 'LONG' ? 'bg-[var(--green-profit)]/10 text-[var(--green-profit)]' : 'bg-[var(--red-loss)]/10 text-[var(--red-loss)]'}`}>
                             {t.type}
                           </span>
                         </div>
                         <div className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">
                            Entry @ ${t.entry.toLocaleString()}
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className={`font-black text-lg font-space ${t.pnl >= 0 ? 'text-[var(--green-profit)]' : 'text-[var(--red-loss)]'}`}>
                         {t.pnl >= 0 ? '+' : ''}${Math.abs(t.pnl).toLocaleString()}
                       </div>
                     </div>
                   </div>
                 ))}
                 
                 {positions.length === 0 && !loading && (
                   <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                      <AlertCircle size={32} className="text-[var(--text-muted)] mb-3" />
                      <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">No active trades</p>
                   </div>
                 )}
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
