import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, UserPlus, Shield, Activity, DollarSign, 
  RefreshCw, Key, ShieldCheck, Plus, Trash2, 
  CheckCircle2, AlertCircle, Signal, Landmark, Bitcoin, CreditCard, X, ChevronRight,
  Wallet, Bell, Settings, TrendingUp, Circle
} from 'lucide-react'
import api from '../services/api'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [brokers, setBrokers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [isConnectingBroker, setIsConnectingBroker] = useState(false)
  
  // Forms
  const [clientForm, setClientForm] = useState({ name: '', email: '', notes: '' })
  const [brokerForm, setBrokerForm] = useState({ 
    name: '', type: 'Angel One', client_id: '', 
    broker_user_id: '', password: '', api_key: '', api_secret: '',
    totp_secret: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cData, bData] = await Promise.all([
        api.clients.list(),
        api.brokers.list()
      ])
      setClients(cData)
      setBrokers(bData)
    } catch (err) {
      console.error('Failed to load hub data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    try {
      await api.clients.create(clientForm)
      setIsAddingClient(false)
      loadData()
    } catch (err) { alert("Failed to add client") }
  }

  const handleConnectBroker = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log("Attempting broker connection with:", brokerForm)
    try {
      const payload = {
        ...brokerForm,
        client_id: brokerForm.client_id ? parseInt(brokerForm.client_id) : null
      }
      console.log("Sending payload:", payload)
      const response = await api.brokers.connect(payload)
      console.log("Broker connection response:", response)
      setIsConnectingBroker(false)
      loadData()
    } catch (err) { 
      console.error("Broker connection error detail:", err.response?.data || err.message)
      alert(`Broker connection failed: ${err.response?.data?.detail || err.message}`) 
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBroker = async (id) => {
    if (!confirm("Are you sure you want to remove this broker?")) return
    try {
      await api.brokers.delete(id)
      loadData()
    } catch (err) { alert("Delete failed") }
  }

  const handleDeleteClient = async (id) => {
    if (!confirm("Remove this portfolio? This cannot be undone.")) return
    try {
      await api.clients.delete(id)
      loadData()
    } catch (err) { alert("Delete failed") }
  }

  return (
    <div className="bg-[#050505] text-zinc-100 min-h-screen flex flex-col font-['Inter'] selection:bg-[var(--orange-primary)]/30 overflow-hidden">
      
      {/* Top Header */}
      <header className="flex items-center bg-[#050505] border-b border-white/5 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 mr-4 border border-white/5 shadow-inner">
          <Wallet className="text-[var(--orange-primary)]" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tighter leading-none text-white uppercase">Client Accounts</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Multi-Account Management</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center rounded-xl size-10 bg-white/5 text-zinc-400 border border-white/5 hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          <button className="flex items-center justify-center rounded-xl size-10 bg-white/5 text-zinc-400 border border-white/5 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 custom-scrollbar">
        {/* Summary Stats */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[150px] flex-1 flex-col gap-1 rounded-[2rem] p-6 bg-[#121212] border border-white/5 backdrop-blur-sm shadow-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Managed Equity</p>
            <p className="text-2xl font-bold tracking-tighter leading-none mt-1 text-white">
              ${brokers.reduce((acc, b) => acc + (b.balance || 0), 0).toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp className="text-green-500" size={14} strokeWidth={2} />
              <p className="text-green-500 text-[10px] font-bold">+0.0% <span className="text-zinc-500 font-medium ml-1">cumulative monthly</span></p>
            </div>
          </div>
          <div className="flex min-w-[150px] flex-1 flex-col gap-1 rounded-[2rem] p-6 bg-[#121212] border border-white/5 backdrop-blur-sm shadow-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Active Client Portfolios</p>
            <p className="text-2xl font-bold tracking-tighter leading-none mt-1 text-white">{clients.length}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <UserPlus className="text-[var(--orange-primary)]" size={14} strokeWidth={2} />
              <p className="text-[var(--orange-primary)] text-[10px] font-bold">+0 <span className="text-zinc-500 font-medium ml-1">onboarded this week</span></p>
            </div>
          </div>
        </div>

        {/* Connected Brokers Section */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold uppercase tracking-tighter text-white">Broker API Integrations</h2>
            <button 
              onClick={() => setIsConnectingBroker(true)}
              className="bg-[var(--orange-primary)] hover:scale-105 text-black text-[10px] font-bold uppercase tracking-widest py-3 px-5 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-orange-500/10 active:scale-95"
            >
              <Plus size={14} strokeWidth={2} />
              Connect Institution
            </button>
          </div>
          
          <div className="space-y-4">
            {brokers.length > 0 ? brokers.map((broker) => (
              <div key={broker.id} className="flex items-center gap-5 bg-[#121212] p-5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group cursor-pointer shadow-xl">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                  {broker.type === 'Binance' ? <Bitcoin className="text-[var(--orange-primary)]" size={24} /> : <Landmark className="text-[var(--orange-primary)]" size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold tracking-tight text-white uppercase">{broker.name}</p>
                    <span className={`px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-bold uppercase tracking-widest border border-green-500/10`}>{broker.status}</span>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-medium tracking-tight mt-1 truncate">
                    {broker.type} • ID: {broker.broker_user_id || 'Institutional'} • Balance: ${broker.balance?.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteBroker(broker.id); }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all mb-1"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse" />
                </div>
              </div>
            )) : (
              <div className="p-10 border border-dashed border-white/10 rounded-[2rem] text-center opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-widest">No Institutions Connected</p>
              </div>
            )}
          </div>
        </section>

        {/* Managed Clients Section */}
        <section className="px-4 py-8">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-lg font-bold uppercase tracking-tighter text-white">Managed Client Portfolios</h2>
            <button 
              onClick={() => setIsAddingClient(true)}
              className="text-[var(--orange-primary)] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all flex items-center gap-1"
            >
              <Plus size={12} /> Add Portfolio
            </button>
          </div>
          
          <div className="bg-[#121212] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] text-zinc-500 uppercase text-[9px] font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Portfolio Account</th>
                    <th className="px-8 py-5 text-right">AUM / Net Equity</th>
                    <th className="px-8 py-5 text-center">Institutional Bridge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {clients.length > 0 ? clients.map((client) => {
                    const totalEquity = client.broker_accounts?.reduce((acc, b) => acc + b.balance, 0) || 0;
                    return (
                      <tr key={client.id} className="hover:bg-white/[0.02] transition-all cursor-pointer group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-[var(--orange-primary)]">
                              {client.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-white uppercase tracking-tight">{client.name}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">SAR-L{client.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className="font-bold text-white text-lg tracking-tight leading-none">${totalEquity > 0 ? totalEquity.toLocaleString() : 'N/A'}</p>
                          <p className={`text-[10px] font-bold mt-1.5 text-zinc-500`}>Direct Allocation</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-4 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 w-max mx-auto group-hover:border-red-500/30 transition-all">
                            <div className="flex items-center gap-2.5">
                              <Landmark className="text-[var(--orange-primary)]" size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                                {client.broker_accounts?.length || 0} Nodes
                              </span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                              className="p-1 rounded-lg hover:bg-red-500/20 text-red-500 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="3" className="px-8 py-20 text-center opacity-30 italic font-bold uppercase tracking-widest text-[10px]">
                        No client profiles registered
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-5 bg-white/[0.01] text-center border-t border-white/5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Institutional Hierarchy Sync: Active
            </div>
          </div>
        </section>
      </main>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddingClient(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#121212] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold uppercase text-white">Register New Portfolio</h3>
                <button onClick={() => setIsAddingClient(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Legal Name / Entity</label>
                  <input 
                    type="text" required value={clientForm.name}
                    onChange={e => setClientForm({...clientForm, name: e.target.value})}
                    placeholder="e.g. Elena Vance"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Contact Email</label>
                  <input 
                    type="email" required value={clientForm.email}
                    onChange={e => setClientForm({...clientForm, email: e.target.value})}
                    placeholder="elena@institution.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Compliance Notes</label>
                  <textarea 
                    value={clientForm.notes} rows={3}
                    onChange={e => setClientForm({...clientForm, notes: e.target.value})}
                    placeholder="Specify risk tier & mandatory controls..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-white text-black font-bold uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 mt-4"
                >
                  Confirm Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connect Broker Modal */}
      <AnimatePresence>
        {isConnectingBroker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsConnectingBroker(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-[#121212] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold uppercase text-white">Establish Institutional Bridge</h3>
                <button onClick={() => setIsConnectingBroker(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleConnectBroker} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Integration Label</label>
                    <input 
                      type="text" required value={brokerForm.name}
                      onChange={e => setBrokerForm({...brokerForm, name: e.target.value})}
                      placeholder="Account Alpha"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Protocol Type</label>
                    <select 
                      value={brokerForm.type}
                      onChange={e => setBrokerForm({...brokerForm, type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white appearance-none"
                    >
                      <option>Angel One</option>
                      <option>Interactive Brokers</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Assign to Portfolio Directory (Optional)</label>
                  <select 
                    value={brokerForm.client_id}
                    onChange={e => setBrokerForm({...brokerForm, client_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white appearance-none"
                  >
                    <option value="">Full Institutional Access</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">API Key</label>
                    <input 
                      type="password" required value={brokerForm.api_key}
                      onChange={e => setBrokerForm({...brokerForm, api_key: e.target.value})}
                      placeholder="••••••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Broker Client ID</label>
                    <input 
                      type="text" required value={brokerForm.broker_user_id}
                      onChange={e => setBrokerForm({...brokerForm, broker_user_id: e.target.value})}
                      placeholder="e.g. S12345"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white"
                    />
                  </div>
                </div>

                {brokerForm.type === 'Angel One' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">TOTP Secret Key (2FA)</label>
                    <input 
                      type="password" required value={brokerForm.totp_secret}
                      onChange={e => setBrokerForm({...brokerForm, totp_secret: e.target.value})}
                      placeholder="e.g. ABC123XYZ..."
                      className="w-full bg-white/5 border border-[var(--orange-primary)]/20 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Broker Password / PIN</label>
                  <input 
                    type="password" required value={brokerForm.api_secret}
                    onChange={e => setBrokerForm({...brokerForm, api_secret: e.target.value})}
                    placeholder="••••••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[var(--orange-primary)]/40 transition-all font-bold text-sm text-white"
                  />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-[var(--orange-primary)] text-black font-bold uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-orange-500/10 hover:scale-[1.01] transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? 'Establishing Connection...' : 'Establish Secure Bridge'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
