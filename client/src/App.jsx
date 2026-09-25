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
    <div className="relative min-h-screen bg-[#070810] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dynamic Background Glowing Spheres */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px] animate-ambient-1" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-[140px] animate-ambient-2" />
        <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] bg-purple-600/10 rounded-full blur-[160px] animate-ambient-1" />
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
      <footer className="relative z-10 border-t border-white/5 bg-[#0a0b16]/60 backdrop-blur-md py-6 px-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">StudyTrack</span>
            <span>—</span>
            <span>Intelligent Focus Analytics & 3D Interactive Visualization</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
