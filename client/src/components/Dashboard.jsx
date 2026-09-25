import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Flame,
  Zap,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const Dashboard = ({ onStartFocus }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getDashboard();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="mt-4 text-xs font-mono text-slate-400">Loading your focus intelligence...</p>
      </div>
    );
  }

  const {
    todayStudyMinutes = 0,
    todayTargetMinutes = 240,
    dailyGoalProgress = 0,
    weekStudyMinutes = 0,
    totalStudyHours = '0.0',
    streak = 1,
    level = 1,
    xp = 0,
    xpProgressInLevel = 0,
    distributionBySubject = [],
    last7DaysActivity = [],
    tasksSummary = { total: 0, completed: 0, pending: 0, completionRate: 0 },
  } = analytics || {};

  const todayHours = (todayStudyMinutes / 60).toFixed(1);
  const targetHours = (todayTargetMinutes / 60).toFixed(0);
  const weekHours = (weekStudyMinutes / 60).toFixed(1);

  // Find max minutes in 7 days for relative chart scaling
  const maxDayMinutes = Math.max(...last7DaysActivity.map((d) => d.minutes), 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Greeting Banner */}
      <div className="relative glass-panel-elevated p-6 sm:p-8 rounded-3xl overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Personal Study Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Scholar'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              You are on a <span className="text-amber-400 font-bold">{streak}-day streak</span>. Complete today's focus target to unlock Level {level + 1}!
            </p>
          </div>

          <button
            onClick={onStartFocus}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition cursor-pointer self-start md:self-auto"
          >
            <span>Launch 3D Timer</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Core Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Today's Focus Card */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Focus</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{todayHours}h</span>
            <span className="text-xs text-slate-400 font-medium">/ {targetHours}h goal</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${dailyGoalProgress}%` }}
            />
          </div>
          <span className="mt-2 block text-[11px] text-slate-400">{dailyGoalProgress}% of daily target</span>
        </div>

        {/* Study Streak Card */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-400">{streak}</span>
            <span className="text-xs text-slate-300 font-medium">Days on Fire</span>
          </div>
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Streak multiplier active</span>
          </div>
          <span className="mt-1 block text-[11px] text-slate-400">Don't break the chain!</span>
        </div>

        {/* Level & XP Progression */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-purple-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Level & Rank</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-purple-300">Lv. {level}</span>
            <span className="text-xs text-slate-400 font-medium">({xp} XP)</span>
          </div>
          {/* Progress to Next Level */}
          <div className="mt-3 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpProgressInLevel}%` }}
            />
          </div>
          <span className="mt-2 block text-[11px] text-slate-400">
            {100 - xpProgressInLevel} XP to Level {level + 1}
          </span>
        </div>

        {/* Weekly & Total Hours */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Weekly Total</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{weekHours}h</span>
            <span className="text-xs text-slate-400 font-medium">past 7 days</span>
          </div>
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-cyan-300 font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>{totalStudyHours}h all-time study</span>
          </div>
          <span className="mt-1 block text-[11px] text-slate-400">
            {tasksSummary.completed} tasks completed
          </span>
        </div>
      </div>

      {/* Analytics Chart & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 7-Day Focus Histogram */}
        <div className="lg:col-span-8 glass-panel-elevated p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">7-Day Focus Activity</h3>
              <p className="text-xs text-slate-400">Daily concentration minutes over the past week</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Minutes Studied</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-48 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2">
            {last7DaysActivity.map((day, idx) => {
              const heightPercent = Math.max(12, Math.round((day.minutes / maxDayMinutes) * 100));
              const isToday = idx === last7DaysActivity.length - 1;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/10 text-[10px] text-slate-200 px-2 py-1 rounded-md mb-2 pointer-events-none whitespace-nowrap shadow-xl">
                    {day.hours}h ({day.minutes}m)
                  </div>

                  {/* Visual Bar */}
                  <div
                    className={`w-full max-w-[42px] rounded-2xl transition-all duration-300 group-hover:scale-105 ${
                      isToday
                        ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25 ring-1 ring-cyan-400/50'
                        : 'bg-gradient-to-t from-slate-800 to-indigo-900/60 hover:from-slate-700 hover:to-indigo-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Day Label */}
                  <span className={`text-[11px] font-bold mt-2 ${isToday ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Breakdown & Tasks */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Subject Distribution */}
          <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subject Breakdown</h3>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-4">
              {distributionBySubject.length > 0 ? (
                distributionBySubject.map((sub, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color || '#6366f1' }} />
                        <span className="font-semibold text-slate-200 truncate max-w-[140px]">{sub.name}</span>
                      </div>
                      <span className="font-mono text-slate-400">{sub.hours}h ({sub.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${sub.percentage}%`, backgroundColor: sub.color || '#6366f1' }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No subject study time recorded yet.</p>
              )}
            </div>
          </div>

          {/* Task Completion Progress */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Task Completion</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {tasksSummary.completed} / {tasksSummary.total}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {tasksSummary.completionRate}% completion rate
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
