import { useState, useEffect } from 'react'
import { Plus, X, Star, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../services/api'

export default function Watchlist({ onSelectSymbol }) {
  const [watchlists, setWatchlists] = useState([])
  const [newSymbol, setNewSymbol] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWatchlists()
  }, [])

  async function loadWatchlists() {
    try {
      const data = await api.watchlist.getWatchlists()
      if (data.length === 0) {
        // Create a default watchlist if none exists
        const defaultW = await api.watchlist.create({ name: 'My Watchlist' })
        setWatchlists([defaultW])
      } else {
        setWatchlists(data)
      }
    } catch (err) {
      console.error("Watchlist load error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function addItem() {
    if (!newSymbol || watchlists.length === 0) return
    try {
      const watchlistId = watchlists[0].id
      await api.watchlist.addItem(watchlistId, { symbol: newSymbol })
      setNewSymbol('')
      loadWatchlists()
    } catch (err) {
      console.error("Add item error:", err)
    }
  }

  async function removeItem(itemId) {
    try {
      await api.watchlist.removeItem(itemId)
      loadWatchlists()
    } catch (err) {
      console.error("Remove item error:", err)
    }
  }

  if (loading) return <div className="p-4 text-[var(--text-muted)] animate-pulse uppercase text-[10px] font-black">Loading Portfolio...</div>

  const activeWatchlist = watchlists[0] || { items: [] }

  return (
    <div className="card h-full flex flex-col border-r border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
          <Star size={14} className="text-[var(--orange-primary)] fill-[var(--orange-primary)]" />
          Watchlist
        </h3>
        <span className="text-[var(--text-muted)] text-[10px] font-black">{activeWatchlist.items.length} ASSETS</span>
      </div>

      <div className="flex gap-2 mb-6">
        <input 
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="ADD SYMBOL..." 
          className="flex-1 bg-black/40 border border-[var(--border-color)] rounded-xl py-2 px-3 text-white font-black text-xs outline-none focus:border-[var(--orange-primary)] uppercase"
        />
        <button 
          onClick={addItem}
          className="p-2 bg-[var(--orange-primary)] text-black rounded-xl hover:scale-105 transition-transform"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {activeWatchlist.items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelectSymbol(item.symbol)}
            className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-[var(--border-color)] hover:bg-black/20 cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-white font-black text-xs">{item.symbol}</div>
              <div className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-tighter">STOCK</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[var(--green-profit)] text-[10px] font-black">+1.24%</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}

        {activeWatchlist.items.length === 0 && (
          <div className="text-center py-10 opacity-30">
            <div className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">No assets tracked</div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          <span>Market Status</span>
          <span className="text-[var(--green-profit)] flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--green-profit)] shadow-[0_0_5px_var(--green-profit)]" />
            Open
          </span>
        </div>
      </div>
    </div>
  )
}
