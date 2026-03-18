import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, Target, ShieldCheck, ArrowRightLeft, 
  Settings2, Activity, Play, Pause, XCircle,
  TrendingUp, TrendingDown, Layers, Calculator
} from 'lucide-react'
import api from '../services/api'
import AdvancedChart from '../components/trading/AdvancedChart'
import { useBinanceOhlcv } from '../hooks/useBinanceOhlcv'

export default function Execution() {
  const [loading, setLoading] = useState(true)
  const [brokers, setBrokers] = useState([])
  const [selectedBroker, setSelectedBroker] = useState(null)
  const [isPaperTrading, setIsPaperTrading] = useState(false)
  const [orderParams, setOrderParams] = useState({
    symbol: 'BTC/USDT',
    side: 'BUY',
    type: 'MARKET',
    quantity: 1.0,
    entryPrice: 65000,
    sl: 64000,
    tp: 68000
  })
  const [calcResult, setCalcResult] = useState(null)
  const [activeOrders, setActiveOrders] = useState([])
  
  // Live Data Stream based on selected symbol
  const chartData = useBinanceOhlcv(orderParams.symbol, '1m')

  useEffect(() => {
    async function init() {
      try {
        const bData = await api.brokers.list()
        setBrokers(bData)
        if (bData.length > 0) setSelectedBroker(bData[0].id)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleCalculate = async () => {
    if (!selectedBroker) return
    const res = await api.risk.calculateSize({
      account_id: selectedBroker,
      entry_price: parseFloat(orderParams.entryPrice),
      stop_loss: parseFloat(orderParams.sl)
    })
    setCalcResult(res)
    setOrderParams(prev => ({ ...prev, quantity: res.suggested_size }))
  }

  const handleExecute = async () => {
    if (!selectedBroker) return
    await api.execution.placeBracket({
      account_id: selectedBroker,
      ...orderParams,
      quantity: parseFloat(orderParams.quantity),
      take_profit: parseFloat(orderParams.tp),
      stop_loss: parseFloat(orderParams.sl),
      is_paper: isPaperTrading
    })
    alert(isPaperTrading ? "Paper Trade Authorized (Simulation)" : "Bracket Order Executed Securely")
  }

  if (loading) return null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">
            Order Execution Hub
          </h1>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1 flex items-center gap-2">
            <Zap size={14} className="text-[var(--orange-primary)]" /> Institutional Smart Order Routing
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#121212] border border-white/5 p-3 rounded-2xl">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${!isPaperTrading ? 'text-green-500' : 'text-zinc-500'}`}>Live</span>
          <button 
            onClick={() => setIsPaperTrading(!isPaperTrading)}
            className={`w-14 h-7 rounded-full p-1 transition-all ${isPaperTrading ? 'bg-[var(--orange-primary)]' : 'bg-zinc-800'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-all ${isPaperTrading ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isPaperTrading ? 'text-[var(--orange-primary)]' : 'text-zinc-500'}`}>Paper</span>
        </div>
      </div>

      {/* Primary Charting Area */}
      <div className="bg-[#121212] border border-white/5 rounded-[32px] p-6 h-[400px]">
        <AdvancedChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Order Entry Terminal */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setOrderParams(p => ({ ...p, side: 'BUY' }))}
                className={`flex-1 py-4 font-bold uppercase tracking-widest rounded-2xl transition-all ${orderParams.side === 'BUY' ? 'bg-green-500 text-black scale-105 shadow-lg shadow-green-500/20' : 'bg-white/5 text-zinc-500 hover:text-green-500 hover:bg-green-500/10'}`}
              >
                Buy / Long
              </button>
              <button 
                onClick={() => setOrderParams(p => ({ ...p, side: 'SELL' }))}
                className={`flex-1 py-4 font-bold uppercase tracking-widest rounded-2xl transition-all ${orderParams.side === 'SELL' ? 'bg-red-500 text-black scale-105 shadow-lg shadow-red-500/20' : 'bg-white/5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10'}`}
              >
                Sell / Short
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Token & Size */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Asset & Allocation</label>
                <div className="flex gap-3">
                  <input 
                    className="flex-1 bg-white/5 border border-white/5 p-4 rounded-xl text-white font-bold uppercase outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold placeholder:text-zinc-700"
                    value={orderParams.symbol}
                    onChange={(e) => setOrderParams(p => ({ ...p, symbol: e.target.value.toUpperCase() }))}
                  />
                  <select 
                    className="bg-white/5 border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[var(--orange-primary)]/40 text-xs"
                    value={selectedBroker}
                    onChange={(e) => setSelectedBroker(e.target.value)}
                  >
                    {brokers.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.type})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Position Size</label>
                    <button onClick={handleCalculate} className="text-[var(--orange-primary)] text-[9px] font-bold uppercase hover:underline flex items-center gap-1">
                      <Calculator size={12} /> Auto-Size (Risk Engine)
                    </button>
                  </div>
                  <input 
                    type="number"
                    className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-white font-bold outline-none focus:border-[var(--orange-primary)]/40"
                    placeholder="LOT SIZE / QUANTITY"
                    value={orderParams.quantity}
                    onChange={(e) => setOrderParams(p => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
              </div>

              {/* Targets & Risk */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Risk Mitigation & Targets</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-[9px] font-bold text-red-500 uppercase">Stop</div>
                    <input 
                      type="number"
                      className="flex-1 bg-red-500/5 border border-red-500/10 p-3 rounded-xl text-red-500 font-bold outline-none focus:border-red-500/40"
                      value={orderParams.sl}
                      onChange={(e) => setOrderParams(p => ({ ...p, sl: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-[9px] font-bold text-green-500 uppercase">Target</div>
                    <input 
                      type="number"
                      className="flex-1 bg-green-500/5 border border-green-500/10 p-3 rounded-xl text-green-500 font-bold outline-none focus:border-green-500/40"
                      value={orderParams.tp}
                      onChange={(e) => setOrderParams(p => ({ ...p, tp: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-white uppercase italic">Advanced Parameters</span>
                    <Settings2 size={16} className="text-zinc-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" className="accent-[var(--orange-primary)]" defaultChecked />
                      PROTECT GAINS (AUTO-BE)
                    </label>
                    <label className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" className="accent-[var(--orange-primary)]" defaultChecked />
                      ONE CANCELS OTHER (OCO)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={handleExecute}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <ArrowRightLeft size={24} /> 
                Authorize Trade Execution
              </button>
            </div>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={18} className="text-[var(--orange-primary)]" /> Risk Confirmation
            </h2>
            
            <AnimatePresence mode="wait">
              {calcResult ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Max Capital At Risk</div>
                    <div className="text-red-500 font-bold text-2xl tracking-tighter">${calcResult.risk_amount.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Effective Leverage</div>
                    <div className="text-white font-bold text-2xl tracking-tighter">{calcResult.leverage.toFixed(2)}x</div>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Notional Order Value</div>
                    <div className="text-white font-bold text-2xl tracking-tighter">${calcResult.notional_value.toLocaleString()}</div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-zinc-600 text-[10px] font-bold uppercase text-center py-12 border-2 border-dashed border-white/5 rounded-2xl italic">
                  Run Risk Engine to <br/> Validate Execution Profile
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-500" /> Institutional Protection
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                <span className="text-[10px] font-bold text-green-500 uppercase">Max Daily Drawdown</span>
                <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-green-500/20 rounded">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                <span className="text-[10px] font-bold text-green-500 uppercase">Dynamic Trailing Stop</span>
                <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-green-500/20 rounded">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                <span className="text-[10px] font-bold text-red-400 uppercase">Global Kill-Switch</span>
                <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-red-500/20 rounded tracking-widest">ARMED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
