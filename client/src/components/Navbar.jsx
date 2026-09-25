import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Timer,
  BarChart3,
  CheckSquare,
  BookOpen,
  History,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  isAmbientPlaying,
  toggleAmbientSound,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'history', label: 'Session Log', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#070810]/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('timer')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-[#0d0f1d] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                StudyTrack
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                3D AI
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 glass-panel px-1.5 py-1 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-indigo-600/80 shadow-md shadow-indigo-500/30 border border-indigo-400/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Ambient Alpha Sound Toggle */}
          <button
            onClick={toggleAmbientSound}
            title={isAmbientPlaying ? 'Mute Alpha Focus Waves' : 'Play Cyber Alpha Waves'}
            className={`p-2 rounded-xl border transition-all ${
              isAmbientPlaying
                ? 'bg-indigo-500/20 text-cyan-300 border-indigo-500/40 shadow-sm shadow-indigo-500/30 animate-pulse'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Gamified Stats (Streak & XP) */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-2">
              {/* Streak */}
              <div
                title="Current Study Streak"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{user?.streak || 1}d</span>
              </div>

              {/* XP & Level */}
              <div
                title="Total Focus XP"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold"
              >
                <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                <span>Lv.{user?.level || 1}</span>
                <span className="text-slate-400 text-[10px] font-normal">({user?.xp || 0} XP)</span>
              </div>
            </div>
          )}

          {/* User Profile or Auth Trigger */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl glass-panel hover:bg-white/10 border border-white/10 transition"
              >
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
                  alt={user?.name || 'User'}
                  className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-500/30"
                />
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'Scholar'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 glass-panel-elevated rounded-2xl py-2 z-50 border border-white/15 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-1 rounded-lg">
                      <span>Level {user?.level || 1} Scholar</span>
                      <span>{user?.xp || 0} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenProfile}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-200 hover:bg-white/10 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Study Goals & Achievements</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 border-t border-white/5"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={loginAsDemo}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                <span>Instant Demo</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-500/30"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0b16]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
