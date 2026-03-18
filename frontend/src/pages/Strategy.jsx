import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, Plus, Play, Save, ChevronDown, Trash2, Settings,
  AlertTriangle, Filter, ArrowRight, Zap, Combine, Power,
  Cpu, Activity, Target, Shield, Gauge, Info, TrendingUp, TrendingDown, X
} from 'lucide-react'
import api from '../services/api'

export default function StrategyBuilder() {
  const [strategyName, setStrategyName] = useState('Mean Reversion V1')
  const [assetClass, setAssetClass] = useState('Crypto')
  const [timeframe, setTimeframe] = useState('1H')
  
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'IF', metric: 'RSI', operator: '<', value: '30' },
    { id: '2', type: 'AND', metric: 'Price', operator: '>', value: 'EMA50' },
    { id: '3', type: 'THEN', action: 'BUY', size: '1.5', sizeType: 'Lots' }
  ])

  const [isDeploying, setIsDeploying] = useState(false)
  const [backtestResults, setBacktestResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const handleSave = async () => {
    try {
      const payload = {
        name: strategyName,
        blocks: blocks,
        asset_class: assetClass,
        timeframe: timeframe
      }
      await api.strategy.createStrategy(payload)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      const payload = {
        name: strategyName,
        blocks: blocks,
        asset_class: assetClass,
        timeframe: timeframe
      }
      await api.strategy.createStrategy(payload)
      const results = await api.strategy.getBacktestResults({
        symbol: assetClass,
        timeframe: timeframe
      })
      setBacktestResults(results)
      
      setTimeout(() => {
        setIsDeploying(false)
        setShowResults(true)
      }, 1500)
    } catch (err) {
      console.error('Deployment failure')
      setIsDeploying(false)
    }
  }

  const addCondition = (type) => {
    const newId = Date.now().toString()
    let newBlock = {}
    if (type === 'AND' || type === 'OR') {
      newBlock = { id: newId, type, metric: 'MACD', operator: '>', value: '0' }
    } else if (type === 'THEN') {
      newBlock = { id: newId, type, action: 'SELL', size: '1.0', sizeType: 'Lots' }
    }
    setBlocks([...blocks, newBlock])
  }

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  return (
    <div className="relative pb-20">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-[var(--orange-primary)]/5 blur-[150px] rounded-full" 
        />
      </div>

      <div className="relative z-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[var(--orange-primary)] shadow-[0_0_10px_var(--orange-primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--orange-primary)]">Strategy Forge v2.0</span>
            </div>
            <h1 className="text-white text-5xl lg:text-7xl font-bold tracking-tighter leading-none uppercase">
               Algo <span className="text-[var(--orange-primary)]">Builder</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm font-medium tracking-wide max-w-xl">
              Visual logic constructor for advanced trading strategies. Deploy directly to live market gateways.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={handleSave}
               className="bg-white/5 border border-white/10 text-white font-bold px-8 py-5 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
             >
               <Save size={18} /> Save Draft
             </motion.button>
             <motion.button
               whileHover={{ scale: 1.05, y: -2 }}
               whileTap={{ scale: 0.95 }}
               onClick={handleDeploy}
               disabled={isDeploying}
               className="bg-[var(--orange-primary)] text-black font-bold px-10 py-5 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(255,145,0,0.2)] transition-all uppercase tracking-widest text-xs disabled:opacity-50"
             >
               {isDeploying ? (
                 <div className="flex items-center gap-3">
                    <Activity size={18} className="animate-spin" /> Deploying strategy...
                 </div>
               ) : (
                 <><Play size={18} strokeWidth={3} fill="black" /> Deploy Strategy</>
               )}
             </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings Panel */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="backdrop-blur-3xl bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <h2 className="text-white font-bold text-xs uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                <Settings size={18} className="text-[var(--orange-primary)]" /> Strategy Settings
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Strategy Name</label>
                  <input 
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold tracking-tight outline-none focus:border-[var(--orange-primary)] transition-all placeholder:text-white/5"
                    placeholder="E.g. MEAN_REVERSION_BTC"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Class</label>
                    <div className="relative">
                       <select 
                         value={assetClass}
                         onChange={(e) => setAssetClass(e.target.value)}
                         className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-[var(--orange-primary)] appearance-none cursor-pointer"
                       >
                         <option>Crypto</option>
                         <option>Forex</option>
                         <option>Indices</option>
                         <option>Equities</option>
                       </select>
                       <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Timeframe</label>
                    <div className="relative">
                       <select 
                         value={timeframe}
                         onChange={(e) => setTimeframe(e.target.value)}
                         className="w-full bg-black border border-white/10 p-5 rounded-2xl text-white font-bold outline-none focus:border-[var(--orange-primary)] appearance-none cursor-pointer"
                       >
                         <option>5M</option>
                         <option>15M</option>
                         <option>1H</option>
                         <option>4H</option>
                         <option>1D</option>
                       </select>
                       <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-black/40 border border-white/5 rounded-[2rem] space-y-4">
                   <div className="flex items-center gap-3">
                      <Shield size={16} className="text-[var(--orange-primary)]" />
                      <h4 className="text-white font-bold text-[10px] uppercase tracking-widest">Risk Mitigation Active</h4>
                   </div>
                   <p className="text-[9px] text-zinc-500 font-medium leading-relaxed uppercase tracking-wider">
                     Global risk controls will automatically throttle execution if loss exceeds predefined thresholds.
                   </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Canvas Component */}
          <div className="lg:col-span-8 backdrop-blur-3xl bg-white/[0.03] border border-white/5 rounded-[3.5rem] relative overflow-hidden flex flex-col min-h-[700px] shadow-3xl group/canvas">
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(var(--orange-primary) 1px, transparent 1px), linear-gradient(90deg, var(--orange-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            <div className="p-10 border-b border-white/5 relative z-10 bg-black/20 backdrop-blur-md flex items-center justify-between">
              <h2 className="text-white font-bold text-xs uppercase tracking-[0.4em] flex items-center gap-4 font-bold">
                 <div className="w-8 h-8 rounded-lg bg-[var(--orange-primary)]/10 flex items-center justify-center text-[var(--orange-primary)]">
                    <Code2 size={16} />
                 </div>
                 Strategy Logic Interface
              </h2>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Gateway Verified</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 lg:p-20 relative z-10 flex flex-col items-center custom-scrollbar">
              
              <AnimatePresence>
                {blocks.map((block, index) => (
                  <motion.div 
                    key={block.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="relative w-full max-w-2xl mb-12"
                  >
                    {/* Visual Connector */}
                    {index > 0 && (
                      <div className="absolute -top-12 left-12 w-0.5 h-12 bg-gradient-to-b from-white/5 to-[var(--orange-primary)]/50" />
                    )}

                    <div className={`
                      backdrop-blur-3xl border rounded-[2.5rem] p-2 flex items-stretch shadow-2xl transition-all duration-500 group/block
                      ${block.type === 'THEN' 
                        ? 'bg-[var(--orange-primary)]/10 border-[var(--orange-primary)]/30' 
                        : 'bg-black/40 border-white/5 hover:border-white/10'}
                    `}>
                      
                      <div className={`
                        flex flex-col items-center justify-center px-8 py-6 rounded-[2rem] font-bold w-36 lg:w-44 flex-shrink-0 transition-all duration-500
                        ${block.type === 'IF' ? 'bg-[var(--orange-primary)] text-black text-2xl tracking-tighter' : ''}
                        ${block.type === 'AND' || block.type === 'OR' ? 'bg-white/5 text-white/40 text-[10px] uppercase tracking-[0.3em]' : ''}
                        ${block.type === 'THEN' ? 'bg-[var(--orange-primary)] text-black text-2xl tracking-tighter' : ''}
                      `}>
                        {block.type}
                        <div className="h-0.5 w-8 bg-black/20 mt-2 rounded-full" />
                      </div>

                      <div className="flex-1 p-6 lg:px-10 flex items-center justify-between gap-6">
                        {block.type !== 'THEN' ? (
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1">
                               <select 
                                 value={block.metric} 
                                 onChange={(e) => {
                                   const newBlocks = [...blocks];
                                   newBlocks[index].metric = e.target.value;
                                   setBlocks(newBlocks);
                                 }}
                                 className="w-full bg-black border border-white/10 text-white font-bold p-4 rounded-2xl outline-none focus:border-[var(--orange-primary)] text-sm appearance-none cursor-pointer"
                               >
                                 <option>RSI (14)</option>
                                 <option>MACD (12,26,9)</option>
                                 <option>Bollinger (20,2)</option>
                                 <option>EMA (200)</option>
                                 <option>VWAP</option>
                                 <option>Volume Surge</option>
                               </select>
                               <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" />
                            </div>

                            <select 
                              value={block.operator}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[index].operator = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              className="bg-black/60 border border-white/10 text-[var(--orange-primary)] font-bold p-4 rounded-2xl outline-none focus:border-[var(--orange-primary)] text-sm w-20 text-center cursor-pointer"
                            >
                              <option>{'>'}</option>
                              <option>{'<'}</option>
                              <option>{'=='}</option>
                              <option>{'>='}</option>
                            </select>

                            <input 
                              value={block.value}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[index].value = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              className="bg-black border border-white/10 text-white font-bold p-4 rounded-2xl outline-none focus:border-[var(--orange-primary)] text-sm flex-1 placeholder:text-white/5"
                              placeholder="Value"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1">
                               <select 
                                 value={block.action}
                                 onChange={(e) => {
                                   const newBlocks = [...blocks];
                                   newBlocks[index].action = e.target.value;
                                   setBlocks(newBlocks);
                                 }}
                                 className={`w-full border font-bold p-4 rounded-2xl outline-none text-sm appearance-none cursor-pointer transition-colors ${block.action === 'BUY' ? 'bg-[var(--green-profit)]/10 border-[var(--green-profit)]/30 text-[var(--green-profit)]' : 'bg-[var(--red-loss)]/10 border-[var(--red-loss)]/30 text-[var(--red-loss)]'}`}
                               >
                                 <option value="BUY">BUY COMMITTED</option>
                                 <option value="SELL">SELL COMMITTED</option>
                                 <option value="CLOSE">CLOSE POSITION</option>
                               </select>
                               <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30" />
                            </div>

                            <input 
                              value={block.size}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[index].size = e.target.value;
                                setBlocks(newBlocks);
                              }}
                              className="bg-black border border-white/10 text-white font-bold p-4 rounded-2xl outline-none focus:border-[var(--orange-primary)] text-sm w-24 text-center"
                            />

                            <div className="relative">
                               <select 
                                 value={block.sizeType}
                                 onChange={(e) => {
                                   const newBlocks = [...blocks];
                                   newBlocks[index].sizeType = e.target.value;
                                   setBlocks(newBlocks);
                                 }}
                                 className="bg-black/60 border border-white/10 text-[var(--text-muted)] font-bold p-4 rounded-2xl outline-none text-[10px] uppercase tracking-widest w-28 appearance-none cursor-pointer"
                               >
                                 <option>Lots</option>
                                 <option>% Eq</option>
                                 <option>USD</option>
                               </select>
                               <ChevronDown size={10} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20" />
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => removeBlock(block.id)}
                          className="w-12 h-12 rounded-xl bg-white/5 text-white/20 hover:text-[var(--red-loss)] hover:bg-[var(--red-loss)]/10 transition-all flex items-center justify-center border border-white/5 opacity-0 group-hover/block:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Forge Actions */}
              <motion.div 
                layout
                className="flex gap-6 mt-8 relative z-20"
              >
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addCondition('AND')}
                  className="bg-white/5 border border-white/10 hover:border-[var(--orange-primary)]/50 text-white px-8 py-5 rounded-3xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl backdrop-blur-3xl"
                >
                  <Filter size={16} className="text-[var(--orange-primary)]" /> Add Condition
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addCondition('THEN')}
                  className="bg-[var(--orange-primary)] text-black px-10 py-5 rounded-3xl font-bold text-[10px] uppercase tracking-[0.2em] hover:shadow-[0_15px_40px_rgba(255,145,0,0.3)] transition-all flex items-center gap-3 shadow-2xl"
                >
                  <Zap size={16} strokeWidth={3} /> Add Result
                </motion.button>
              </motion.div>

            </div>
          </div>

        </div>

        {/* Intelligence Overlay (Backtest Results) */}
        <AnimatePresence>
          {showResults && backtestResults && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowResults(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              />
              <motion.div 
                initial={{ scale: 0.9, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#050505] border border-white/10 w-full max-w-5xl rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 flex flex-col max-h-[90vh]"
              >
                <div className="p-12 lg:px-16 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_green]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-green-500">Validation Verified</span>
                     </div>
                    <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                      Strategy <span className="text-[var(--orange-primary)]">Analysis</span>
                    </h2>
                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.4em] mt-3">Strategy Engine Result: {backtestResults.strategy_name}</p>
                  </div>
                  <button 
                    onClick={() => setShowResults(false)}
                    className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all"
                  >
                    <X size={28} />
                  </button>
                </div>

                <div className="p-12 lg:p-16 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                   {/* Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Net Profit', value: backtestResults.metrics.net_profit, color: 'var(--green-profit)', icon: TrendingUp },
                      { label: 'Win Rate', value: backtestResults.metrics.win_rate, color: 'white', icon: Target },
                      { label: 'Max Drawdown', value: backtestResults.metrics.max_drawdown, color: 'var(--red-loss)', icon: TrendingDown },
                      { label: 'Risk Score', value: backtestResults.metrics.risk_score, color: 'var(--orange-primary)', icon: Shield },
                    ].map((m, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] group hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-3 bg-black/40 rounded-xl text-zinc-600">
                              <m.icon size={16} />
                           </div>
                           <div className="h-1.5 w-1.5 rounded-full bg-[var(--orange-primary)]" />
                        </div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.4em] mb-3">{m.label}</p>
                        <p className="text-3xl font-bold tracking-tighter" style={{ color: m.color }}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                       <div className="bg-black/40 border border-white/5 rounded-[3rem] p-12 h-80 flex flex-col items-center justify-center space-y-6 relative group/curve overflow-hidden">
                          <Cpu size={100} strokeWidth={1} className="text-[var(--orange-primary)] opacity-5 absolute" />
                          <div className="text-center relative z-10">
                             <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.6em] mb-4">Equity Projection</p>
                             <div className="flex items-center gap-12 justify-center">
                               {backtestResults.equity_curve.slice(0, 10).map((v, i) => (
                                 <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-1.5 bg-[var(--orange-primary)] opacity-40 group-hover/curve:opacity-100 transition-all rounded-full" style={{ height: `${Math.max(20, (v.value / backtestResults.equity_curve[0].value) * 10 - 50)}px` }} />
                                    <div className="h-1 w-1 rounded-full bg-white/10" />
                                 </div>
                               ))}
                             </div>
                             <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-[0.3em] mt-8">Projected Final Balance: ${backtestResults.equity_curve[backtestResults.equity_curve.length-1].value.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                       <div className="bg-black border border-white/5 rounded-[3rem] p-10 space-y-8">
                          <h4 className="text-[10px] text-white font-bold uppercase tracking-[0.4em] mb-2">Backtest Signals</h4>
                          {backtestResults.signals.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center group/sig pb-6 border-b border-white/5 last:border-0 last:pb-0">
                               <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-2xl flex items-center justify-center font-bold text-xs w-20 ${s.type === 'BUY' ? 'text-[var(--green-profit)] bg-[var(--green-profit)]/10' : 'text-[var(--red-loss)] bg-[var(--red-loss)]/10'}`}>
                                     {s.type}
                                  </div>
                                  <div>
                                     <p className="text-white font-bold text-sm">${s.price.toLocaleString()}</p>
                                     <p className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">Confidence: {s.confidence}</p>
                                  </div>
                                </div>
                               <ChevronRight size={14} className="text-white/10 group-hover/sig:text-[var(--orange-primary)] transition-all" />
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-[var(--orange-primary)] text-black font-bold py-8 rounded-[2.5rem] shadow-[0_20px_60px_rgba(255,145,0,0.3)] flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-sm"
                    >
                      <Zap size={20} strokeWidth={3} fill="black" /> Live Deployment
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowResults(false)}
                      className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-8 rounded-[2.5rem] hover:bg-white/10 transition-all uppercase tracking-[0.3em] text-sm"
                    >
                      Adjust strategy
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
