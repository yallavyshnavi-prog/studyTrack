import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  Zap,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        res = await register(name.trim(), email.trim(), password);
      } else {
        res = await login(email.trim(), password);
      }

      if (res && res.success) {
        onClose();
      } else if (res && res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginAsDemo();
      if (res && res.success) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative glass-panel-elevated p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/15 shadow-2xl overflow-hidden">
        
        {/* Glow ambient circle */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl glass-panel hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isRegister ? 'Create Your Account' : 'Welcome to StudyTrack'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Join today and level up your study habits with 3D analytics'
              : 'Sign in to access your sessions, streak, and focus levels'}
          </p>
        </div>

        {/* One-Click Instant Demo Login */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>⚡ Instant Demo Access (Alex Rivera)</span>
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Or with email
          </span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full glass-input text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-white/10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full glass-input text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-white/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength="6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full glass-input text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-white/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-indigo-300 transition"
          >
            {isRegister
              ? 'Already have an account? Sign In here'
              : "Don't have an account yet? Sign Up for free"}
          </button>
        </div>
      </div>
    </div>
  );
};
