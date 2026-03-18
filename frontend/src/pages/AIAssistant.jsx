import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Bot, Send, Search, Info } from 'lucide-react'
import api from '../services/api'

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { id: 'initial-1', text: "Hello Trader! I've been monitoring the markets. **BTC/USDT** is showing strong momentum after a double bottom formation.", sender: 'ai', time: '10:42 AM' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    async function loadInsights() {
      const data = await api.ai.getInsights()
      if (data) setInsights(data)
    }
    loadInsights()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { 
      id: Date.now().toString(), 
      text: input, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
    
    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setLoading(true)

    const response = await api.ai.chat(currentInput)
    if (response) {
      setMessages(prev => [...prev, {
        id: response.id,
        text: response.response,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Insights Panel */}
      <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <h2 className="text-white font-black text-xl italic uppercase tracking-tight">AI Insights</h2>
        
        <AnimatePresence>
          {insights.map((insight, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`card border-l-4 ${idx === 0 ? 'border-l-[var(--orange-primary)]' : 'border-l-[#8b5cf6]'}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className={idx === 0 ? 'text-[var(--orange-primary)]' : 'text-[#8b5cf6]'} />
                <span className="text-white font-extrabold text-sm uppercase">{insight.type}</span>
              </div>
              <div className="text-2xl font-black text-white font-space mb-2">{insight.title}</div>
              <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">{insight.asset} • {insight.confidence}% CONFIDENCE</p>
              <div className="mt-4 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 text-xs text-[var(--text-secondary)] leading-relaxed">
                {insight.description}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="card space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Key Levels</h3>
          {[
            { label: 'Resistance 2', value: '$68,500', color: 'var(--red-loss)' },
            { label: 'Resistance 1', value: '$65,200', color: 'var(--orange-primary)' },
            { label: 'Support 1', value: '$61,200', color: 'var(--green-profit)' },
            { label: 'Support 2', value: '$58,400', color: 'var(--bg-card-hover)' },
          ].map(level => (
            <div key={level.label} className="flex justify-between items-center">
              <span className="text-[var(--text-muted)] text-[10px] font-black uppercase">{level.label}</span>
              <span className="text-white font-black text-sm p-1 px-2 rounded-lg bg-black/40" style={{ borderLeft: `3px solid ${level.color}` }}>{level.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-8 flex flex-col card h-full border-t-4 border-t-[var(--orange-primary)]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--orange-primary)] flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Bot size={22} color="black" strokeWidth={3} />
              </div>
              <div>
                <div className="text-white font-black text-base italic uppercase tracking-tight">Sarvex AI Assist</div>
                <div className="flex items-center gap-1.5 text-[var(--green-profit)] text-[9px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--green-profit)] animate-pulse" />
                  {loading ? 'Thinking...' : 'Online'}
                </div>
              </div>
           </div>
           <Info size={18} className="text-[var(--text-muted)] cursor-pointer hover:text-white transition-colors" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end ml-auto' : 'max-w-[80%]'}`}>
              <div className={`p-4 rounded-2xl border ${
                msg.sender === 'user' 
                ? 'bg-[var(--orange-primary)] text-black border-transparent rounded-tr-none font-extrabold shadow-lg shadow-orange-500/10' 
                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] rounded-tl-none text-white text-sm font-medium leading-relaxed'}`}>
                {msg.text}
              </div>
              <span className={`text-[var(--text-muted)] text-[9px] font-black uppercase ${msg.sender === 'user' ? 'mr-1' : 'ml-1'}`}>
                {msg.sender === 'ai' ? 'Assistant' : 'You'} • {msg.time}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-tl-none flex gap-2">
                <div className="w-1.5 h-1.5 bg-[var(--orange-primary)] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[var(--orange-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-[var(--orange-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about patterns, levels, or strategies..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-5 pl-14 pr-16 text-white font-bold outline-none focus:border-[var(--orange-primary)] transition-all shadow-inner"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--orange-primary)] flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <Send size={18} color="black" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
