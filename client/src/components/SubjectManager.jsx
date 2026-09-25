import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BookOpen,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Palette,
} from 'lucide-react';

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#3b82f6', // Blue
];

export const SubjectManager = ({ onSelectSubjectForTimer }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.subjects.getAll();
      if (res.success && res.data) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.warn('Subject fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.subjects.create({
        name: name.trim(),
        description: description.trim(),
        color,
        weeklyTargetHours: Number(weeklyTargetHours) || 5,
      });

      if (res.success) {
        setSubjects((prev) => [res.data, ...prev]);
        setShowModal(false);
        setName('');
        setDescription('');
      }
    } catch (err) {
      console.error('Error creating subject:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to remove this subject?')) return;
    try {
      const res = await api.subjects.delete(id);
      if (res.success) {
        setSubjects((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error('Delete subject error:', err);
    }
  };

  const totalWeeklyTarget = subjects.reduce((acc, s) => acc + (s.weeklyTargetHours || 0), 0);
  const totalStudiedMins = subjects.reduce((acc, s) => acc + (s.totalStudiedMinutes || 0), 0);
  const totalStudiedHours = (totalStudiedMins / 60).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Knowledge Tracks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Subjects & Goals</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Define your core learning tracks and balance weekly study targets.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Target Progress Bar Overview */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Weekly Target Goal</span>
            <span className="text-xl font-black text-white">
              {totalStudiedHours}h studied <span className="text-slate-400 text-xs font-normal">/ {totalWeeklyTarget}h target</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-bold text-slate-200">
            {subjects.length} Active Tracks
          </span>
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center">
          <BookOpen className="w-12 h-12 text-indigo-400/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No subjects added yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create your first study subject (e.g. Data Structures, Web Development, Calculus) to track your progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const studiedHours = ((sub.totalStudiedMinutes || 0) / 60).toFixed(1);
            const target = sub.weeklyTargetHours || 5;
            const progress = sub.progressPercent || Math.min(100, Math.round(((sub.totalStudiedMinutes || 0) / (target * 60)) * 100));

            return (
              <div
                key={sub._id}
                className="glass-panel-elevated p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Accent glow corner */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: sub.color || '#6366f1' }}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3.5 h-3.5 rounded-lg shadow-sm"
                        style={{ backgroundColor: sub.color || '#6366f1' }}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {target}h Weekly Target
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSubject(sub._id)}
                      title="Remove Subject"
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition">
                    {sub.name}
                  </h3>

                  {sub.description && (
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{sub.description}</p>
                  )}
                </div>

                {/* Progress Stats */}
                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-bold text-white">{studiedHours}h / {target}h ({progress}%)</span>
                  </div>

                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: sub.color || '#6366f1',
                      }}
                    />
                  </div>

                  <button
                    onClick={() => onSelectSubjectForTimer && onSelectSubjectForTimer(sub._id)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 border border-white/5 hover:border-indigo-500/30 transition cursor-pointer"
                  >
                    <span>Focus on this Subject</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Create Subject Track</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Systems & Cloud"
                  className="w-full glass-input text-xs text-white py-2.5 px-3 rounded-xl border border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key topics, syllabus, or learning outcomes..."
                  className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Target Hours</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={weeklyTargetHours}
                  onChange={(e) => setWeeklyTargetHours(e.target.value)}
                  className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10"
                />
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Accent Color</label>
                <div className="flex items-center space-x-2.5">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl transition-all ${
                        color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-70'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
