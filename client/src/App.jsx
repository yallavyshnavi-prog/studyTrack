import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { FocusTimer } from './components/FocusTimer';
import { Dashboard } from './components/Dashboard';
import { TaskTracker } from './components/TaskTracker';
import { SubjectManager } from './components/SubjectManager';
import { SessionHistory } from './components/SessionHistory';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { startAmbientSound, stopAmbientSound } from './utils/audio';
import { Sparkles, ShieldCheck } from 'lucide-react';

function StudyTrackContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timer');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedSubjectForTimer, setSelectedSubjectForTimer] = useState(null);

  // Toggle ambient focus audio (cyber alpha binaural waves)
  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      stopAmbientSound();
      setIsAmbientPlaying(false);
    } else {
      startAmbientSound();
      setIsAmbientPlaying(true);
    }
  };

  // Switch to timer with specific subject selected
  const handleSelectSubjectForTimer = (subjectId) => {
    setSelectedSubjectForTimer(subjectId);
    setActiveTab('timer');
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Cinematic Ethereal Cosmic Background Wallpaper */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out scale-100"
        style={{ backgroundImage: `url('/cosmic-theme-bg.jpg')` }}
      />

      {/* 2. Soft Vignette & Luminance Contrast Masks for Crystal-Clear Readability */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#050612]/80 via-[#07091a]/60 to-[#04050f]/92 backdrop-blur-[1px]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_65%)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_85%_35%,rgba(6,182,212,0.15),transparent_55%)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_15%_75%,rgba(168,85,247,0.12),transparent_55%)]" />

      {/* 3. Subtle Animated Cosmic Stardust Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-cyan-300 rounded-full animate-sparkle" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-sparkle" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-purple-300 rounded-full animate-sparkle" style={{ animationDelay: '2.4s' }} />
        <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-teal-200 rounded-full animate-sparkle" style={{ animationDelay: '1.8s' }} />
        
        {/* Soft Ambient Aurora Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/12 rounded-full blur-[140px] animate-ambient-1" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-[150px] animate-ambient-2" />
        <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] bg-purple-600/10 rounded-full blur-[170px] animate-ambient-1" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Sticky Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAmbientPlaying={isAmbientPlaying}
          toggleAmbientSound={toggleAmbientSound}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* View Switcher */}
        <main className="flex-1 pb-16 md:pb-8">
          {activeTab === 'timer' && (
            <FocusTimer
              isAmbientPlaying={isAmbientPlaying}
              toggleAmbientSound={toggleAmbientSound}
              initialSubject={selectedSubjectForTimer}
              onSessionCompleted={() => {
                // Keep stats fresh
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard onStartFocus={() => setActiveTab('timer')} />
          )}

          {activeTab === 'tasks' && <TaskTracker />}

          {activeTab === 'subjects' && (
            <SubjectManager onSelectSubjectForTimer={handleSelectSubjectForTimer} />
          )}

          {activeTab === 'history' && <SessionHistory />}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-indigo-500/15 bg-[#070918]/70 backdrop-blur-xl py-6 px-4 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-wide">StudyTrack</span>
            <span className="text-cyan-400/60">•</span>
            <span className="text-slate-300">Cosmic Aurora Focus & 3D Analytics</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Stack Ready (MongoDB • Express • React 19 • Three.js)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudyTrackContent />
    </AuthProvider>
  );
}
