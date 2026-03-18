import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, Zap, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

export default function LoginMFAModal({ isOpen, onClose, onConfirm, brokerName = "Broker" }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = otp.join('')
    if (token.length < 6) {
      setError('Please enter the full 6-digit code')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(token)
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 p-8 rounded-[32px] shadow-[0_0_100px_rgba(242,120,13,0.1)] overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full" />
            
            <div className="flex justify-between items-start mb-8 relative">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                 <Shield size={28} className="text-orange-500" />
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic mb-2">Security Verification</h2>
              <p className="text-zinc-400 text-sm font-medium">Please enter the 6-digit TOTP code from your authenticator app to authorize session for <span className="text-orange-500 font-bold">{brokerName}</span>.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-orange-500 outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
                  />
                ))}
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wider"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-black font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
              >
                {loading ? <Zap className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                Verify & Establish Connection
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] font-black text-[#5c4030] uppercase tracking-widest">
               <Zap size={14} className="text-orange-500" /> Secure Encryption Active
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
