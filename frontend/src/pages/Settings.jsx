import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Wallet, ChevronRight, LogOut, Camera } from 'lucide-react'
import api from '../services/api'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profData, confData] = await Promise.all([
          api.settings.getProfile(),
          api.settings.getConfig()
        ])
        if (profData) setProfile(profData)
        if (confData) setConfig(confData)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'broker', label: 'Broker', icon: Wallet },
  ]

  if (loading && !profile) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-[var(--orange-primary)] font-black animate-pulse">LOADING YOUR PROFILE...</div>
        </div>
      )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Nav */}
      <div className="lg:col-span-3 space-y-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === tab.id ? 'bg-[var(--orange-primary)] text-black shadow-xl shadow-orange-500/20' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
        <button className="w-full flex items-center gap-4 p-5 rounded-3xl text-[var(--red-loss)] hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-widest mt-8">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9">
        <div className="card border-t-4 border-t-[var(--orange-primary)] py-10">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center gap-8 border-b border-[var(--border-color)] pb-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-[var(--bg-secondary)] border-4 border-[var(--orange-primary)] flex items-center justify-center font-black text-[var(--orange-primary)] text-4xl shadow-2xl">
                    {profile?.name[0]}
                  </div>
                  <button className="absolute bottom-0 right-0 p-3 rounded-2xl bg-[var(--orange-primary)] text-black shadow-lg hover:scale-110 transition-transform">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-white text-3xl font-black font-space">{profile?.name}</h1>
                  <p className="text-[var(--text-muted)] text-[11px] font-black uppercase tracking-[0.3em] mt-2">{profile?.email} • {profile?.tier} Tier</p>
                  <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                    <span className="bg-[var(--green-profit)]/10 text-[var(--green-profit)] px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase">Member since {profile?.joined}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest italic">Personal Information</h3>
                  <div>
                    <label className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-2 block">Full Name</label>
                    <input type="text" defaultValue={profile?.name} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-[var(--orange-primary)] transition-all" />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-2 block">Email Address</label>
                    <input type="email" defaultValue={profile?.email} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-[var(--orange-primary)] transition-all" />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest italic">Risk Controls</h3>
                  <div>
                    <label className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-2 block">Daily Loss Limit (%)</label>
                    <input type="number" defaultValue={config?.risk.daily_loss_limit} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-[var(--orange-primary)] transition-all" />
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5 group hover:border-[var(--orange-primary)] transition-all">
                    <div>
                      <div className="text-white font-bold text-xs uppercase tracking-widest">Global Stop-Loss</div>
                      <div className="text-zinc-500 text-[9px] font-bold mt-1">Automatic SL for all trades</div>
                    </div>
                    <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${config?.risk.auto_sl ? 'bg-[var(--green-profit)]' : 'bg-zinc-800'}`}>
                      <div className={`w-6 h-6 rounded-full bg-white transition-all shadow-lg ${config?.risk.auto_sl ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button className="px-10 py-5 rounded-2xl bg-[var(--orange-primary)] text-black font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Save Changes</button>
              </div>
            </motion.div>
          )}

          {activeTab !== 'profile' && (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
               <Shield size={48} className="text-[var(--text-muted)] mb-4" />
               <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.3em]">Module currently under maintenance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
