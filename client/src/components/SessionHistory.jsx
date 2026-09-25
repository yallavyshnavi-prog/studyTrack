import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  History,
  Trash2,
  Search,
  Download,
} from 'lucide-react';

export const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [sessRes, subsRes] = await Promise.all([
        api.sessions.getRecent(50),
        api.subjects.getAll(),
      ]);

      if (sessRes.success) setSessions(sessRes.data);
      if (subsRes.success) setSubjects(subsRes.data);
    } catch (err) {
      console.warn('Error fetching session history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this study log entry?')) return;
    try {
      const res = await api.sessions.delete(id);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error('Delete session error:', err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const headers = ['Date', 'Duration (Minutes)', 'Subject', 'Timer Type', 'XP Earned', 'Notes'];
    const rows = sessions.map((s) => [
      new Date(s.completedAt).toLocaleString(),
      s.durationMinutes,
      s.subject?.name || 'General Focus',
      s.timerType,
      s.xpEarned,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studytrack_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterSubject !== 'all') {
      const subId = s.subject?._id || s.subject;
      if (subId !== filterSubject) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const subjectName = s.subject?.name?.toLowerCase() || '';
      const notes = s.notes?.toLowerCase() || '';
      return subjectName.includes(q) || notes.includes(q);
    }
    return true;
  });

  const totalMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);
  const totalXP = sessions.reduce((acc, s) => acc + (s.xpEarned || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Study Session Log</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            A comprehensive record of every deep work block, duration, and XP earned.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={sessions.length === 0}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 border border-white/10 text-xs sm:text-sm font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 block font-medium">Logged Sessions</span>
          <span className="text-2xl font-black text-white mt-1 block">{sessions.length}</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 block font-medium">Total Concentration</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">{totalHours} Hours</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 block font-medium">Accumulated Focus XP</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">+{totalXP} XP</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or topics..."
            className="w-full glass-input text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-white/10"
          />
        </div>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="glass-input text-xs text-slate-300 py-2 px-3 rounded-xl border border-white/10 bg-[#0d0f1d] w-full sm:w-auto"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading study sessions...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center">
          <History className="w-12 h-12 text-indigo-400/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No sessions found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'No sessions match your search query.' : 'Complete your first focus session to start your streak!'}
          </p>
        </div>
      ) : (
        <div className="glass-panel-elevated rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Focus Notes</th>
                  <th className="py-3 px-4">XP</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSessions.map((session) => {
                  const subject = session.subject;
                  const dateStr = session.completedAt
                    ? new Date(session.completedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Just now';

                  return (
                    <tr key={session._id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {subject ? (
                          <span
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-white/10 bg-white/5"
                            style={{ color: subject.color || '#818cf8' }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: subject.color || '#818cf8' }}
                            />
                            <span>{subject.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">General Focus</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {session.durationMinutes} min
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold">
                          {session.timerType || 'pomodoro'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {session.notes || <span className="italic text-slate-600">No notes</span>}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-400 whitespace-nowrap">
                        +{session.xpEarned || 25} XP
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSession(session._id)}
                          title="Delete entry"
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
