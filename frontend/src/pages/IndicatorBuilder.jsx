import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Code2, Play, Save, Trash2, Zap, Layout, Eye, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function IndicatorBuilder() {
  const [code, setCode] = useState(`// Custom Indicator: SMA + Offset
// close: array of prices
// period: number

const period = 20;
const offset = 500;

return close.map((p, i) => {
  if (i < period) return null;
  const slice = close.slice(i - period, i);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  return sma + offset;
});`)

  const [testData] = useState(() => {
    const data = []
    let price = 60000
    for(let i=0; i<100; i++) {
       price += (Math.random() - 0.5) * 500
       data.push({ time: i, close: price })
    }
    return data
  })

  const results = useMemo(() => {
    try {
      const prices = testData.map(d => d.close)
      // DANGEROUS: In a real app, use a safe sandbox like 'isolated-vm' or a math parser
      // For this demo, we'll use a controlled Function constructor
      const generator = new Function('close', code)
      const output = generator(prices)
      
      return testData.map((d, i) => ({
        ...d,
        indicator: output[i]
      }))
    } catch (err) {
      console.error("Script error:", err)
      return testData
    }
  }, [code, testData])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Indicator Foundry</h1>
        <p className="text-[#7c5a40] font-bold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
          <Code2 size={14} className="text-orange-500" /> Bespoke Algorithmic Scripting
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                 <Zap size={16} className="text-orange-500" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-white">Logic Script (JS)</span>
             </div>
             <div className="flex gap-2">
               <button className="p-2 text-zinc-500 hover:text-white transition-all"><Save size={18} /></button>
               <button className="p-2 text-zinc-500 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
             </div>
          </div>
          
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-transparent p-8 text-sm font-mono text-orange-200/80 outline-none resize-none min-h-[400px] leading-relaxed selection:bg-orange-500/20"
            spellCheck="false"
          />
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#120a00] border border-[#1c1000] p-8 rounded-[32px]">
            <h2 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <Eye size={18} className="text-orange-500" /> Live Visual Sandbox
            </h2>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1000" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip 
                    contentStyle={{ background: '#120a00', border: '1px solid #3d2700', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'black' }}
                  />
                  <Line type="monotone" dataKey="close" stroke="#3d2700" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="indicator" stroke="#f97316" strokeWidth={3} dot={false} animationDuration={300} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 blur-3xl rounded-full group-hover:bg-orange-500/10 transition-all duration-700" />
             <div className="flex items-center gap-3 mb-4">
                <Info size={18} className="text-orange-500" />
                <h3 className="text-white font-black text-xs uppercase tracking-widest">Foundry Guide</h3>
             </div>
             <p className="text-zinc-400 text-xs leading-relaxed font-medium">
               Your script should be a valid JavaScript function body that returns an array of values mapping to each price point. 
               Use the <code className="text-orange-400">close</code> array of historical prices to calculate trends, volatility, or custom risk zones.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
