import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";

/**
 * Premium StockCard component for high-end trading UI.
 * Features glassmorphism, smooth animations, and real-time data fetching.
 */
export default function StockCard({ symbol, name }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Use environment variable for API key if available, otherwise fallback to demo key
      const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY || "YOUR_KEY";
      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );
      const json = await res.json();
      
      if (json["Global Quote"]) {
        setData(json["Global Quote"]);
        setError(null);
      } else if (json["Note"]) {
        // API limit reached
        setError("API Limit");
      } else {
        setError("Symbol not found");
      }
    } catch (err) {
      console.error("Alpha Vantage fetch error:", err);
      setError("Network Error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Poll every minute (Alpha Vantage free tier is 25 requests/day)
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="w-[240px] h-[160px] rounded-3xl bg-[#121212] border border-white/5 p-6 flex flex-col justify-center items-center gap-3">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={24} className="text-zinc-700" />
        </motion.div>
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Initialising...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[240px] h-[160px] rounded-3xl bg-[#121212] border border-rose-500/20 p-6 flex flex-col justify-center items-center text-center">
        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">{error}</span>
        <p className="text-xs text-zinc-500">{symbol}</p>
        <button 
          onClick={fetchData}
          className="mt-3 text-[9px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const price = parseFloat(data["05. price"]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const change = parseFloat(data["09. change"]);
  const percent = data["10. change percent"];
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: "rgba(255, 255, 255, 0.15)" }}
      className="relative w-[240px] p-6 rounded-[2.5rem] bg-[#121212] border border-white/5 overflow-hidden group transition-all"
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 blur-[60px] opacity-20 transition-colors duration-1000 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white mb-0.5">{symbol.split('.')[0]}</h3>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{name || (symbol.endsWith('.BSE') ? 'BSE INDIA' : 'NSE INDIA')}</p>
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>

      {/* Price Section */}
      <div className="mb-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={price}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tighter text-white"
          >
            ₹{price}
          </motion.h2>
        </AnimatePresence>
        
        <div className={`flex items-center gap-1 mt-1 font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
           <span className="text-sm font-bold">{isPositive ? '+' : ''}{change.toFixed(2)}</span>
           <span className="text-[10px] font-bold opacity-60">({percent})</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-orange-500' : 'bg-emerald-500'} animate-pulse`} />
           <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">{isRefreshing ? 'Syncing' : 'Live'}</span>
        </div>
        <Activity size={12} className="text-zinc-800" />
      </div>

      {/* Subtle Progress Bar (Auto-refresh hint) */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 h-[1px] bg-white/10"
      />
    </motion.div>
  );
}
