import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, UserPlus, Mail, Lock, User, ShieldCheck, Eye, EyeOff, Sparkles, Orbit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [wakingUp, setWakingUp] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setWakingUp(false)

    const wakeTimer = setTimeout(() => {
      setWakingUp(true)
    }, 4000)

    try {
      if (isLogin) {
        await api.auth.login(email, password)
      } else {
        await api.auth.register(email, password, name)
      }
      clearTimeout(wakeTimer)
      
      if (onLogin) {
        onLogin()
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      clearTimeout(wakeTimer)
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.')
    } finally {
      clearTimeout(wakeTimer)
      setLoading(false)
      setWakingUp(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden font-space">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ff9100]/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff4d00]/20 blur-[150px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100 mix-blend-overlay pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="p-4 bg-[var(--orange-primary)] rounded-[2rem] shadow-[0_0_50px_rgba(255,145,0,0.3)] mb-6 cursor-pointer"
          >
            <ShieldCheck size={40} className="text-black" />
          </motion.div>
          <div className="text-center">
            <h1 className="text-white text-4xl font-bold tracking-tighter uppercase leading-none mb-2">
              SARVEX <span className="text-[var(--orange-primary)]">TRADER</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] w-4 bg-orange-500/30" />
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Institutional Trading Terminal</p>
              <span className="h-[1px] w-4 bg-orange-500/30" />
            </div>
          </div>
        </div>

        <div className="card backdrop-blur-3xl bg-white/[0.03] border-white/10 p-1 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="bg-[#121212]/80 p-8 sm:p-10 rounded-[2.8rem]">
            <div className="flex gap-2 p-1.5 bg-black/50 rounded-2xl mb-10 border border-white/5 shadow-inner">
              <button 
                onClick={() => setIsLogin(true)}
                className={`relative flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${isLogin ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                {isLogin && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-[var(--orange-primary)] rounded-xl shadow-[0_4px_20px_rgba(255,145,0,0.4)]"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                   <LogIn size={14} /> Log In
                </span>
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`relative flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${!isLogin ? 'text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                {!isLogin && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-[var(--orange-primary)] rounded-xl shadow-[0_4px_20px_rgba(255,145,0,0.4)]"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <UserPlus size={14} /> Register
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-2"
                  >
                    <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
                    <div className="relative group">
                      <div className="absolute left-[1px] top-[1px] bottom-[1px] w-14 flex items-center justify-center bg-white/5 rounded-l-[1.2rem] border-r border-white/5">
                        <User size={18} className="text-zinc-500 group-focus-within:text-[var(--orange-primary)] transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required={!isLogin}
                        className="w-full bg-black/40 border border-white/10 focus:border-[var(--orange-primary)] rounded-2xl py-4.5 pl-18 pr-6 text-white text-sm outline-none transition-all placeholder:text-zinc-700 group-hover:bg-black/60 font-medium"
                        placeholder="Your Name"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-4 mb-2 block">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-[1px] top-[1px] bottom-[1px] w-14 flex items-center justify-center bg-white/5 rounded-l-[1.2rem] border-r border-white/5">
                    <Mail size={18} className="text-zinc-500 group-focus-within:text-[var(--orange-primary)] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 focus:border-[var(--orange-primary)] rounded-2xl py-4.5 pl-18 pr-6 text-white text-sm outline-none transition-all placeholder:text-zinc-700 group-hover:bg-black/60 font-medium"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-4 mb-2 block">Password</label>
                <div className="relative group">
                  <div className="absolute left-[1px] top-[1px] bottom-[1px] w-14 flex items-center justify-center bg-white/5 rounded-l-[1.2rem] border-r border-white/5">
                    <Lock size={18} className="text-zinc-500 group-focus-within:text-[var(--orange-primary)] transition-colors" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 focus:border-[var(--orange-primary)] rounded-2xl py-4.5 pl-18 pr-14 text-white text-sm outline-none transition-all placeholder:text-zinc-700 group-hover:bg-black/60 font-medium"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center shadow-lg"
                >
                  ⚠ CRITICAL ERROR: {error}
                </motion.div>
              )}

              {loading && wakingUp && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest text-center leading-relaxed"
                >
                  <Orbit size={14} className="mx-auto mb-2 animate-spin" />
                  INITIALIZING SECURE RENDER CLUSTER...<br/>COLD START IN PROCESS (UP TO 60S)
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="group relative w-full py-5 rounded-[1.5rem] bg-[var(--orange-primary)] text-black text-xs font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(255,145,0,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(255,145,0,0.4)] hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-[3px] border-black/20 border-t-black rounded-full animate-spin" />
                    <span>AUTHENTICATING</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    {isLogin ? <Sparkles size={18} /> : <Orbit size={18} />}
                    <span>{isLogin ? 'INITIALIZE SYSTEM' : 'BOOTSTRAP PROFILE'}</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-10 flex items-center justify-center gap-8">
               <div className="h-[1px] flex-1 bg-white/5" />
               <div className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.2em]">Quantum Secure Encryption</div>
               <div className="h-[1px] flex-1 bg-white/5" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
