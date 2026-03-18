import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutGrid, Share2, Users, User, Brain, Zap, 
  Bell, Menu, LogOut, Code2, Layers, Globe, Beaker, ShieldCheck,
  ChevronRight, X, Github, Settings
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/intelligence', icon: Brain, label: 'AI Intelligence' },
  { path: '/markets', icon: Globe, label: 'Markets' },
  { path: '/portfolio', icon: Layers, label: 'Portfolio' },
  { path: '/strategy', icon: Code2, label: 'Strategies' },
  { path: '/risk-management', icon: ShieldCheck, label: 'Risk Controls' },
  { path: '/brokers', icon: Share2, label: 'Accounts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppShell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex font-['Inter'] selection:bg-[var(--orange-primary)]/30 overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--orange-primary)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/10 blur-[120px] rounded-full" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[var(--sidebar-width)] h-screen flex-col bg-[#0c0c0c] border-r border-white/5 relative z-50">
        <div className="p-8">
          <div 
            className="flex items-center gap-3 cursor-pointer group mb-10"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-10 h-10 bg-[var(--orange-primary)] rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-[0_0_20px_rgba(242,120,13,0.2)]">
              <Zap className="text-black" size={20} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-tight leading-none uppercase">Sarvex</span>
              <span className="text-[var(--orange-primary)] text-[8px] font-bold tracking-[0.4em] uppercase leading-none mt-1 opacity-60">Terminal v1.2</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                    isActive 
                    ? 'bg-white/5 text-white' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-[var(--orange-primary)]' : 'group-hover:text-white'} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/5 space-y-4">
           <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 group cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                <User size={20} className="text-zinc-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">Nensi Patel</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Pro License</p>
              </div>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white transition-all" />
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen relative z-10 overflow-hidden">
        
        {/* Responsive Header */}
        <header className="h-20 lg:h-24 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-2xl relative z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
               <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-1">Navigation</h2>
               <h1 className="text-xl font-bold tracking-tight">
                 {navItems.find(n => n.path === location.pathname)?.label || 'Terminal'}
               </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <div className="hidden md:flex gap-1 p-1 bg-white/5 border border-white/5 rounded-xl mr-4">
               <div className="px-3 py-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 rounded-lg flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-emerald-500" />
                 MARKET CONNECTION
               </div>
            </div>

            <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all group relative">
              <Bell size={18} />
              <div className="absolute top-3 right-3 lg:top-4 lg:right-4 w-1.5 h-1.5 bg-[var(--orange-primary)] rounded-full border border-black animate-pulse" />
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all group"
            >
              <User size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <section className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-6 lg:p-12 min-h-full">
             <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full"
                >
                  {children}
                </motion.div>
             </AnimatePresence>
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden sticky bottom-0 left-0 right-0 z-50 px-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
          <div className="glass-card flex items-center justify-around p-2 pointer-events-auto bg-black/60 shadow-2xl backdrop-blur-3xl border-t border-white/5">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative p-4 rounded-2xl transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-zinc-500'
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[var(--orange-primary)]' : ''} />
                  {isActive && (
                    <motion.div 
                      layoutId="mobile-nav-indicator"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--orange-primary)] rounded-full"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] bg-[#0c0c0c] z-[70] lg:hidden p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--orange-primary)] rounded-lg flex items-center justify-center rotate-45">
                      <Zap className="-rotate-45 text-black" size={16} strokeWidth={3} />
                    </div>
                    <span className="font-bold tracking-tight uppercase">Sarvex</span>
                 </div>
                 <button 
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400"
                 >
                   <X size={20} />
                 </button>
              </div>

              <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        isActive 
                        ? 'bg-white/5 text-white' 
                        : 'text-zinc-500'
                      }`}
                    >
                      <item.icon size={20} className={isActive ? 'text-[var(--orange-primary)]' : ''} />
                      <span className="text-base font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="pt-8 mt-auto border-t border-white/5 space-y-4">
                 <div className="flex items-center gap-4 p-2">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                       <User size={24} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-bold">Nensi Patel</p>
                      <p className="text-xs text-zinc-500 font-medium">Pro License Active</p>
                    </div>
                 </div>
                 <button className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-400/5 transition-all font-bold">
                    <LogOut size={18} />
                    Sign Out
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
