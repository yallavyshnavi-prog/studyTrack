import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { StudyVisualizer3D } from './3d/StudyVisualizer3D';
import { playCompletionChime } from '../utils/audio';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Coffee,
  Brain,
  Award,
} from 'lucide-react';

const TIMER_PRESETS = [
  { id: 'pomodoro', label: 'Pomodoro', minutes: 25, icon: Brain, color: 'from-indigo-500 to-purple-600' },
  { id: 'deep-dive', label: 'Deep Dive', minutes: 50, icon: Sparkles, color: 'from-blue-600 to-indigo-600' },
  { id: 'short-break', label: 'Short Break', minutes: 5, icon: Coffee, color: 'from-emerald-500 to-teal-600' },
  { id: 'long-break', label: 'Long Break', minutes: 15, icon: Coffee, color: 'from-teal-600 to-cyan-600' },
];

export const FocusTimer = ({ isAmbientPlaying, toggleAmbientSound, onSessionCompleted, initialSubject }) => {
  const { updateUser } = useAuth();
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || '');
  const [subjects, setSubjects] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);
  const totalSeconds = durationMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  // Sync initialSubject if prop updates
  useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  // Load available subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.subjects.getAll();
        if (res.success && res.data) {
          setSubjects(res.data);
          if (res.data.length > 0 && !selectedSubject && !initialSubject) {
            setSelectedSubject(res.data[0]._id);
          }
        }
      } catch (err) {
        console.warn('Could not fetch subjects:', err);
      }
    };
    fetchSubjects();
  }, [initialSubject]);

  // Timer Tick Interval
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Handle Mode Change
  const handleModeChange = (modeId, mins) => {
    setIsRunning(false);
    setTimerMode(modeId);
    setDurationMinutes(mins);
    setTimeLeft(mins * 60);
  };

  // Format Time display MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Complete and Log Session
  const handleSessionComplete = async () => {
    playCompletionChime();

    // Trigger colorful confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#38bdf8', '#c084fc', '#34d399', '#f59e0b'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    const completedMins = Math.max(1, Math.round((totalSeconds - timeLeft) / 60) || durationMinutes);
    setIsSubmitting(true);

    try {
      const res = await api.sessions.log({
        durationMinutes: completedMins,
        subject: selectedSubject || null,
        timerType: timerMode,
        notes: sessionNotes,
      });

      const xpGained = res.xpEarned || completedMins + 5;
      setShowCelebration({
        minutes: completedMins,
        xp: xpGained,
        subjectName: subjects.find((s) => s._id === selectedSubject)?.name || 'General Focus',
      });

      if (res.userUpdates && updateUser) {
        updateUser(res.userUpdates);
      }

      if (onSessionCompleted) {
        onSessionCompleted();
      }
    } catch (err) {
      console.error('Error logging session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual Reset
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col items-center transition-all ${
        isFullscreen ? 'bg-[#070810] min-h-screen p-6 justify-center' : 'py-6 px-4 max-w-5xl mx-auto'
      }`}
    >
      {/* Celebration Modal / Banner */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-elevated border border-indigo-500/40 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
              <Award className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Focus Session Complete!</h3>
            <p className="text-sm text-slate-300 mt-2">
              You just crushed <span className="text-cyan-400 font-bold">{showCelebration.minutes} minutes</span> of deep work in{' '}
              <span className="text-indigo-300 font-semibold">{showCelebration.subjectName}</span>!
            </p>

            <div className="my-5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-around">
              <div>
                <span className="block text-2xl font-black text-amber-400">+{showCelebration.xp} XP</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Earned</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="block text-2xl font-black text-cyan-400">🔥 +1</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Streak Kept</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCelebration(null);
                handleReset();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition cursor-pointer"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* Main Focus Control Container */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Interactive 3D Crystal Visualizer */}
        <div className="lg:col-span-6 w-full flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[420px] rounded-3xl glass-panel-glow border border-indigo-500/20 overflow-hidden flex items-center justify-center shadow-2xl">
            <StudyVisualizer3D
              timerState={isRunning ? 'running' : 'idle'}
              timerType={timerMode}
              isRunning={isRunning}
            />

            {/* Glowing Ring overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/5 ring-1 ring-inset ring-white/10" />
          </div>
          <p className="mt-3 text-[11px] text-slate-500 text-center font-mono">
            3D Focus Core dynamically reacts to your concentration state & modes
          </p>
        </div>

        {/* Right Column: Timer HUD, Controls & Setup */}
        <div className="lg:col-span-6 w-full flex flex-col space-y-5">
          
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIMER_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = timerMode === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleModeChange(preset.id, preset.minutes)}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-2xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br ' + preset.color + ' text-white border-transparent shadow-lg shadow-indigo-500/25 scale-[1.02]'
                      : 'glass-panel text-slate-400 border-white/10 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{preset.label}</span>
                  <span className="text-[10px] opacity-80">{preset.minutes}m</span>
                </button>
              );
            })}
          </div>

          {/* Central Timer Display HUD */}
          <div className="relative glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center overflow-hidden">
            
            {/* Progress Bar background glow */}
            <div
              className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />

            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-1 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{timerMode.replace('-', ' ')}</span>
            </span>

            {/* Giant Digital Time */}
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-md select-none my-2">
              {formatTime(timeLeft)}
            </div>

            {/* Subject Selector & Progress Tag */}
            <div className="mt-2 w-full max-w-xs flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full glass-input text-xs font-medium text-slate-200 py-1.5 px-3 rounded-xl border border-white/10 bg-[#0c0e1a]/80 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">General Focus (No Subject)</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id} className="bg-[#0f111f] text-slate-200">
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Objective / Note */}
            <div className="mt-3 w-full max-w-xs">
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="What are you focusing on right now?"
                className="w-full glass-input text-xs text-slate-200 py-2 px-3 rounded-xl border border-white/10 placeholder-slate-500 text-center"
              />
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-6 flex items-center space-x-3">
              {/* Play / Pause */}
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-500/35'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Session</span>
                  </>
                )}
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                title="Reset Timer"
                className="p-3.5 rounded-2xl glass-panel hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition active:rotate-180"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Complete Now */}
              <button
                onClick={handleSessionComplete}
                disabled={isSubmitting}
                title="Log & Complete Session"
                className="p-3.5 rounded-2xl glass-panel hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>

            {/* Ambient & Fullscreen Utility Badges */}
            <div className="mt-6 pt-4 border-t border-white/5 w-full flex items-center justify-between text-xs text-slate-400 px-2">
              <button
                onClick={toggleAmbientSound}
                className="flex items-center space-x-1.5 hover:text-cyan-300 transition"
              >
                {isAmbientPlaying ? <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                <span>{isAmbientPlaying ? 'Alpha Beats On' : 'Alpha Sound Off'}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="flex items-center space-x-1.5 hover:text-indigo-300 transition"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Zen Fullscreen'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
