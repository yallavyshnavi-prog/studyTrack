import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
  Filter,
  CheckCircle2,
  BookOpen,
  X,
} from 'lucide-react';

export const TaskTracker = () => {
  const { updateUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskMinutes, setNewTaskMinutes] = useState(45);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Tasks & Subjects
  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, subsRes] = await Promise.all([
        api.tasks.getAll(),
        api.subjects.getAll(),
      ]);

      if (tasksRes.success) setTasks(tasksRes.data);
      if (subsRes.success) setSubjects(subsRes.data);
    } catch (err) {
      console.warn('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle Task Completion
  const toggleTaskStatus = async (task) => {
    const isNowCompleted = task.status !== 'completed';
    const newStatus = isNowCompleted ? 'completed' : 'pending';

    if (isNowCompleted) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#38bdf8'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }

    try {
      const res = await api.tasks.update(task._id, { status: newStatus });
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, status: newStatus, completedAt: res.data.completedAt } : t))
        );
        if (res.xpAwarded && updateUser) {
          updateUser((prev) => ({ ...prev, xp: (prev.xp || 0) + res.xpAwarded }));
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Delete Task
  const deleteTask = async (taskId) => {
    try {
      const res = await api.tasks.delete(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.tasks.create({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        subject: newTaskSubject || null,
        priority: newTaskPriority,
        estimatedMinutes: Number(newTaskMinutes) || 45,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
      });

      if (res.success) {
        setTasks((prev) => [res.data, ...prev]);
        setShowAddModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskDueDate('');
      }
    } catch (err) {
      console.error('Create task error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'pending' && task.status === 'completed') return false;
    if (filterStatus === 'completed' && task.status !== 'completed') return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterSubject !== 'all') {
      const subId = task.subject?._id || task.subject;
      if (subId !== filterSubject) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const priorityStyles = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Productivity & Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Study Tasks</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Organize study goals, track milestones, and earn +15 XP for every completed task.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full md:w-64 glass-input text-xs text-slate-200 py-2 px-3 rounded-xl border border-white/10"
        />

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto">
          {['all', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="glass-input text-xs text-slate-300 py-1.5 px-3 rounded-xl border border-white/10 bg-[#0d0f1d] w-full md:w-auto"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Subject Filter */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="glass-input text-xs text-slate-300 py-1.5 px-3 rounded-xl border border-white/10 bg-[#0d0f1d] w-full md:w-auto"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center">
          <CheckCircle2 className="w-12 h-12 text-indigo-400/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || filterStatus !== 'all'
              ? 'No tasks match your active filters. Try resetting the search or filters.'
              : 'Add your first study task or milestone to supercharge your study momentum.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const subject = task.subject;
            return (
              <div
                key={task._id}
                className={`glass-panel p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                  isCompleted
                    ? 'border-emerald-500/20 bg-emerald-950/10 opacity-75'
                    : 'border-white/10 hover:border-indigo-500/30'
                }`}
              >
                {/* Left: Checkbox & Content */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4
                        className={`text-sm font-bold text-white truncate ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          priorityStyles[task.priority] || priorityStyles.medium
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Subject Tag */}
                      {subject && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10 bg-white/5 flex items-center space-x-1"
                          style={{ color: subject.color || '#818cf8' }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: subject.color || '#818cf8' }}
                          />
                          <span>{subject.name}</span>
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{task.description}</p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>~{task.estimatedMinutes}m focus</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {isCompleted && (
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>+15 XP Earned</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <button
                  onClick={() => deleteTask(task._id)}
                  title="Delete Task"
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>Create Study Task</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Master Binary Search Algorithms"
                  className="w-full glass-input text-xs text-white py-2.5 px-3 rounded-xl border border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Notes, references, or specific problems to solve..."
                  className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10 bg-[#0e101f]"
                  >
                    <option value="">General (No subject)</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10 bg-[#0e101f]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Focus Time (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(e.target.value)}
                    className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full glass-input text-xs text-white py-2 px-3 rounded-xl border border-white/10 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
