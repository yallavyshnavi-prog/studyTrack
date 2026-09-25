import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  User,
  Award,
  Sparkles,
  Flame,
  Zap,
  Check,
  CheckCircle2,
} from 'lucide-react';

const AVATAR_SEEDS = ['Alex', 'FocusBot', 'Nova', 'Cyber', 'Scholar', 'Zen', 'Quantum', 'Titan'];

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [targetDailyHours, setTargetDailyHours] = useState(user?.targetDailyHours || 4);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Alex'}`
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await api.auth.updateProfile({
        name,
        targetDailyHours: Number(targetDailyHours),
        avatar: selectedAvatar,
      });

      if (res.success) {
        updateUser(res.user);
        setSuccessMsg('Profile goals updated successfully!');
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    {
      id: 'first',
      title: 'First Step',
      desc: 'Completed your first study session',
      unlocked: true,
      icon: Sparkles,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'streak',
      title: 'Flame Keeper',
      desc: 'Maintained a 5+ day focus streak',
      unlocked: (user?.streak || 0) >= 5,
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'level',
      title: 'Level 3 Scholar',
      desc: 'Reached Level 3 through deep work XP',
      unlocked: (user?.level || 0) >= 3,
      icon: Zap,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'marathon',
      title: 'Zen Master',
      desc: 'Logged more than 10 total hours',
      unlocked: (user?.xp || 0) >= 300,
      icon: Award,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative glass-panel-elevated p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-white/15 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl glass-panel hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Study Profile & Goals</h2>
            <p className="text-xs text-slate-400">Tune your learning targets and view your achievements</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AVATAR_SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative p-1 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500/20 scale-110 shadow-lg shadow-indigo-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <img src={url} alt={seed} className="w-full aspect-square rounded-lg" />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[9px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10"
            />
          </div>

          {/* Target Daily Hours Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-300">Daily Focus Goal</label>
              <span className="font-bold text-indigo-300 font-mono">{targetDailyHours} Hours / Day</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={targetDailyHours}
              onChange={(e) => setTargetDailyHours(e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 hr (Light)</span>
              <span>4 hrs (Optimal)</span>
              <span>12 hrs (Intense)</span>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-white mb-2.5 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Earned Badges & Milestones</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {achievements.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start space-x-2.5 ${
                      item.unlocked
                        ? 'border-white/15 bg-white/5 opacity-100'
                        : 'border-white/5 bg-white/[0.02] opacity-40'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        {item.unlocked && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
