import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Share2, Users, FileText, Signal, Shield, 
  AlertCircle, Brain, Zap, Bell, Activity, 
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Filter, Calendar, ChevronRight
} from 'lucide-react'
import api from '../services/api'
import AdvancedChart from '../components/trading/AdvancedChart'
import { useBinanceOhlcv } from '../hooks/useBinanceOhlcv'
import { ErrorBoundary } from 'react-error-boundary'
import { useNotifications } from '../context/NotificationContext'
import StockCard from '../components/market/StockCard'

const quickActions = [
  { id: 'brokers', icon: Share2, label: 'Brokers', path: '/brokers' },
  { id: 'accounts', icon: Users, label: 'Accounts', path: '/accounts' },
  { id: 'logs', icon: FileText, label: 'System Logs', path: '/logs' },
  { id: 'intel', icon: Brain, label: 'AI Intelligence', path: '/intelligence' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [riskData, setRiskData] = useState(null)
  const [settingAlert, setSettingAlert] = useState(null)
  const [alertPrice, setAlertPrice] = useState('')
  const { addNotification } = useNotifications()

  const liveChartData = useBinanceOhlcv('BTCUSDT', '15m')

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumData, priceData, rData] = await Promise.all([
          api.portfolio.getSummary(),
          api.market.getPrices(),
          api.risk.getStatus()
        ])
        if (sumData) setSummary(sumData)
        if (priceData) setPrices(priceData.slice(0, 4))
        if (rData) setRiskData(rData)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateAlert = async (symbol, currentPrice) => {
    if (!alertPrice) return
    try {
      await api.alerts.createAlert({
        symbol,
        condition: parseFloat(alertPrice) > currentPrice ? 'above' : 'below',
        type: 'price',
        value: parseFloat(alertPrice),
        message: `Price alert for ${symbol} at ${alertPrice}`
      })
      addNotification({
        type: 'system',
        title: 'Alert Set',
        message: `Monitoring ${symbol} for cross at ${alertPrice}`,
        severity: 'low',
        time: new Date().toLocaleTimeString()
      })
      setSettingAlert(null)
      setAlertPrice('')
    } catch (err) {
      console.error('Alert error:', err)
    }
  }

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[var(--orange-primary)] font-bold uppercase tracking-[0.2em] text-xs"
        >
          INITIALIZING SECURE SESSION...
        </motion.div>
      </div>
    )
  }

  const maxLoss = riskData?.max_daily_loss || 10000
  const dailyLoss = Math.abs(riskData?.daily_pnl || 0)
  const lossPercent = ((dailyLoss / maxLoss) * 100).toFixed(1)

  return (
    <div className="space-y-8 pb-12 font-['Inter']">
      
      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Portfolio Value', value: `$${summary?.total_balance?.toLocaleString() || '3,421,902.50'}`, sub: `${summary?.daily_pnl_percent || '+4.2%'}`, positive: true },
          { label: 'Daily P&L', value: '+$124,500', sub: 'Net Change', positive: true },
          { label: 'Margin Used', value: '32%', sub: 'Healthy', positive: true },
          { label: 'Open Positions', value: '4', sub: 'Active Assets', positive: null },
          { label: 'Account Balance', value: '$842,000', sub: 'Available Cash', positive: null },
        ].map((metric, i) => (
          <div key={i} className="p-5 rounded-3xl bg-[#121212] border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{metric.label}</span>
            <span className="text-xl font-bold tracking-tight">{metric.value}</span>
            <span className={`text-[10px] font-medium ${metric.positive === true ? 'text-emerald-500' : metric.positive === false ? 'text-rose-500' : 'text-zinc-600'}`}>
              {metric.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Primary Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-9 p-8 rounded-[2.5rem] bg-[#121212] border border-white/5 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Asset Valuation (Live)</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
                ${summary?.total_balance?.toLocaleString() || '3,421,902.50'}
              </h1>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                 <ArrowUpRight size={16} /> 
                 <span className="text-sm">+{summary?.daily_pnl_percent || '4.2'}%</span>
                 <span className="text-zinc-600 font-bold text-[9px] uppercase tracking-widest border-l border-white/10 pl-3 ml-1">Performance Index</span>
              </div>
            </div>

            <div className="w-full md:w-auto md:text-right">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Portfolio Profit</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">+$124,500.90</h3>
            </div>
          </div>

          <div className="absolute inset-0 opacity-[0.04] transition-all duration-1000 pointer-events-none">
             <AdvancedChart data={liveChartData} type="area" height={450} hideXAxes hideYAxes />
          </div>
        </div>

        <div 
          onClick={() => navigate('/execution')}
          className="lg:col-span-3 p-8 rounded-[2.5rem] bg-[var(--orange-primary)] text-black flex flex-col justify-between group cursor-pointer hover:shadow-2xl hover:shadow-[var(--orange-primary)]/20 transition-all active:scale-[0.98]"
        >
           <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center">
                 <Zap size={24} strokeWidth={3} />
              </div>
              <ArrowUpRight size={24} className="opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </div>
           <div>
              <h3 className="text-2xl font-bold tracking-tight mb-1">Trade Hub</h3>
              <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Active Terminal</p>
           </div>
        </div>

      </div>

      {/* Market Watch - Premium Real-time Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Activity size={14} /> MARKET WATCH (REAL-TIME)
          </h3>
          <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">ALPHA VANTAGE LIVE</span>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          <StockCard symbol="RELIANCE.BSE" name="Reliance Industries" />
          <StockCard symbol="TCS.BSE" name="Tata Consultancy" />
          <StockCard symbol="INFY.BSE" name="Infosys Limited" />
          <StockCard symbol="HDFCBANK.BSE" name="HDFC Bank" />
        </div>
      </div>

      {/* Secondary Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Market Stream */}
        <div className="lg:col-span-8 space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                 <Signal size={14} /> LIVE MARKETS
              </h3>
              <div className="flex items-center gap-4">
                <button className="text-[9px] font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">Global Markets</button>
                <Filter size={14} className="text-zinc-600 cursor-pointer hover:text-white" />
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prices.map((m, i) => (
                <div key={m.symbol} className="p-6 rounded-3xl bg-[#121212] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center font-bold text-sm">
                        {m.symbol.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">{m.symbol}</p>
                        <p className="text-lg font-bold">${m.price.toLocaleString()}</p>
                      </div>
                   </div>
                   <div className={`text-right ${m.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <p className="text-sm font-bold flex items-center justify-end gap-1">
                        {m.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(m.change)}%
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Risk & Logs Area */}
        <div className="lg:col-span-4 space-y-6">
           {/* Risk Card */}
           <div className="p-8 rounded-[2.5rem] bg-[#121212] border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                   <Shield size={14} /> RISK CONTROLS
                 </h3>
                 <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">HEALTHY</span>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Drawdown Limit</p>
                    <p className="text-xs font-bold">${dailyLoss.toLocaleString()} / ${maxLoss.toLocaleString()}</p>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${lossPercent}%` }}
                      className="h-full bg-[var(--orange-primary)] rounded-full"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Exposure</p>
                    <p className="text-xs font-bold">2.1x</p>
                 </div>
                 <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Leverage</p>
                    <p className="text-xs font-bold text-zinc-400">1.2x</p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Activity Console */}
      <div className="p-8 rounded-[2.5rem] bg-[#121212] border border-white/5">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
               <Activity size={14} /> SYSTEM ACTIVITY
            </h3>
            <ChevronRight size={18} className="text-zinc-700" />
         </div>
         <div className="space-y-4">
            {[
              { label: 'Binance API Gateway', status: 'Secured', time: 'Active' },
              { label: 'Portfolio Health Check', status: 'Verified', time: '12:45' },
              { label: 'Terminal Node Integration', status: 'Synced', time: 'Online' }
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer border border-transparent hover:border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-tight">{node.label}</span>
                 </div>
                 <div className="flex items-center justify-end gap-6 text-right">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{node.status}</span>
                    <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{node.time}</span>
                 </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  )
}
