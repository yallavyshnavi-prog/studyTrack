// StudyTrack API Client with JWT Bearer Token Support and Offline Resilience

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '/api';

const getHeaders = () => {
  const token = localStorage.getItem('studytrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Initial Seed Data for Demo & Offline Resilience
const INITIAL_SUBJECTS = [
  {
    _id: 'sub-1',
    name: 'Computer Science & AI',
    color: '#6366f1',
    weeklyTargetHours: 8,
    description: 'Algorithms, Data Structures & Neural Networks',
    totalStudiedMinutes: 285,
    progressPercent: 59,
  },
  {
    _id: 'sub-2',
    name: 'Full Stack Web Dev',
    color: '#06b6d4',
    weeklyTargetHours: 10,
    description: 'React 19, Three.js, Node.js & MongoDB',
    totalStudiedMinutes: 420,
    progressPercent: 70,
  },
  {
    _id: 'sub-3',
    name: 'Mathematics & Logic',
    color: '#ec4899',
    weeklyTargetHours: 5,
    description: 'Discrete Math, Linear Algebra & Proofs',
    totalStudiedMinutes: 160,
    progressPercent: 53,
  },
  {
    _id: 'sub-4',
    name: 'System Architecture',
    color: '#10b981',
    weeklyTargetHours: 6,
    description: 'Distributed Systems, Caching & Microservices',
    totalStudiedMinutes: 190,
    progressPercent: 52,
  },
];

const INITIAL_TASKS = [
  {
    _id: 'task-1',
    title: 'Optimize Three.js Focus Crystal shader performance',
    description: 'Tune orbital ring geometry and particle cloud blend mode',
    priority: 'high',
    status: 'completed',
    subject: { _id: 'sub-2', name: 'Full Stack Web Dev', color: '#06b6d4' },
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    estimatedMinutes: 45,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'task-2',
    title: 'Dynamic Programming: Knapsack & LIS practice',
    description: 'Solve 4 medium-hard LeetCode DP problems with memoization',
    priority: 'high',
    status: 'pending',
    subject: { _id: 'sub-1', name: 'Computer Science & AI', color: '#6366f1' },
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    estimatedMinutes: 60,
  },
  {
    _id: 'task-3',
    title: 'Review Linear Algebra: Eigenvalues & Vector Spaces',
    description: 'Chapters 4-5 exercises and review orthogonality proofs',
    priority: 'medium',
    status: 'pending',
    subject: { _id: 'sub-3', name: 'Mathematics & Logic', color: '#ec4899' },
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    estimatedMinutes: 40,
  },
  {
    _id: 'task-4',
    title: 'Study Distributed Caching strategies (Redis & Memcached)',
    description: 'Understand cache invalidation patterns and Redis Sentinel',
    priority: 'low',
    status: 'pending',
    subject: { _id: 'sub-4', name: 'System Architecture', color: '#10b981' },
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    estimatedMinutes: 50,
  },
  {
    _id: 'task-5',
    title: 'Design StudyTrack Glassmorphic UI Dashboard',
    description: 'Implement dark modern theme with glowing borders and micro-interactions',
    priority: 'high',
    status: 'completed',
    subject: { _id: 'sub-2', name: 'Full Stack Web Dev', color: '#06b6d4' },
    dueDate: new Date(Date.now() - 172800000).toISOString(),
    estimatedMinutes: 90,
    completedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const INITIAL_SESSIONS = [
  {
    _id: 'sess-1',
    subject: { _id: 'sub-2', name: 'Full Stack Web Dev', color: '#06b6d4' },
    durationMinutes: 45,
    timerType: 'pomodoro',
    notes: 'Three.js 3D crystal viewport and particle setup',
    xpEarned: 50,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'sess-2',
    subject: { _id: 'sub-1', name: 'Computer Science & AI', color: '#6366f1' },
    durationMinutes: 50,
    timerType: 'pomodoro',
    notes: 'Graph traversal BFS/DFS review and cycle detection',
    xpEarned: 55,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: 'sess-3',
    subject: { _id: 'sub-3', name: 'Mathematics & Logic', color: '#ec4899' },
    durationMinutes: 30,
    timerType: 'pomodoro',
    notes: 'Matrix transformations and vector projections',
    xpEarned: 35,
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'sess-4',
    subject: { _id: 'sub-4', name: 'System Architecture', color: '#10b981' },
    durationMinutes: 60,
    timerType: 'pomodoro',
    notes: 'CAP theorem, database replication and event-driven queues',
    xpEarned: 65,
    completed: true,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Helper to get local data
const getLocalData = (key, fallback) => {
  try {
    const data = localStorage.getItem(`studytrack_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalData = (key, value) => {
  try {
    localStorage.setItem(`studytrack_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage error:', e);
  }
};

const handleResponse = async (res) => {
  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status}: ${res.statusText || 'Server Error'})`);
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        return await handleResponse(res);
      } catch (err) {
        // Fallback for offline demo
        if (email.toLowerCase().includes('demo')) {
          const user = {
            id: 'demo-user-id',
            name: 'Alex Rivera (Demo)',
            email: 'demo@studytrack.app',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
            targetDailyHours: 4,
            xp: 420,
            level: 4,
            streak: 5,
          };
          return { success: true, token: 'demo-local-jwt', user };
        }
        throw err;
      }
    },
    register: async (name, email, password) => {
      try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        return await handleResponse(res);
      } catch (err) {
        // Fallback for offline register
        const user = {
          id: 'user-' + Date.now(),
          name,
          email,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          targetDailyHours: 4,
          xp: 50,
          level: 1,
          streak: 1,
        };
        return { success: true, token: 'demo-local-jwt', user };
      }
    },
    getMe: async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        const localUser = getLocalData('user', {
          id: 'demo-user-id',
          name: 'Alex Rivera (Demo)',
          email: 'demo@studytrack.app',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
          targetDailyHours: 4,
          xp: 420,
          level: 4,
          streak: 5,
        });
        return { success: true, user: localUser };
      }
    },
    updateProfile: async (profileData) => {
      try {
        const res = await fetch(`${BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(profileData),
        });
        return await handleResponse(res);
      } catch {
        const current = getLocalData('user', {});
        const updated = { ...current, ...profileData };
        setLocalData('user', updated);
        return { success: true, user: updated };
      }
    },
  },

  // Subjects
  subjects: {
    getAll: async () => {
      try {
        const res = await fetch(`${BASE_URL}/subjects`, {
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        const subs = getLocalData('subjects', INITIAL_SUBJECTS);
        return { success: true, count: subs.length, data: subs };
      }
    },
    create: async (subjectData) => {
      try {
        const res = await fetch(`${BASE_URL}/subjects`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(subjectData),
        });
        return await handleResponse(res);
      } catch {
        const subs = getLocalData('subjects', INITIAL_SUBJECTS);
        const newSub = {
          _id: 'sub-' + Date.now(),
          ...subjectData,
          totalStudiedMinutes: 0,
          progressPercent: 0,
        };
        subs.unshift(newSub);
        setLocalData('subjects', subs);
        return { success: true, data: newSub };
      }
    },
    update: async (id, subjectData) => {
      try {
        const res = await fetch(`${BASE_URL}/subjects/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(subjectData),
        });
        return await handleResponse(res);
      } catch {
        const subs = getLocalData('subjects', INITIAL_SUBJECTS);
        const index = subs.findIndex((s) => s._id === id);
        if (index !== -1) {
          subs[index] = { ...subs[index], ...subjectData };
          setLocalData('subjects', subs);
          return { success: true, data: subs[index] };
        }
        throw new Error('Subject not found');
      }
    },
    delete: async (id) => {
      try {
        const res = await fetch(`${BASE_URL}/subjects/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        let subs = getLocalData('subjects', INITIAL_SUBJECTS);
        subs = subs.filter((s) => s._id !== id);
        setLocalData('subjects', subs);
        return { success: true, message: 'Subject deleted' };
      }
    },
  },

  // Tasks
  tasks: {
    getAll: async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.subject) params.append('subject', filters.subject);

        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`${BASE_URL}/tasks${query}`, {
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        let tasks = getLocalData('tasks', INITIAL_TASKS);
        if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
        if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
        if (filters.subject) {
          tasks = tasks.filter((t) => t.subject && (t.subject._id === filters.subject || t.subject === filters.subject));
        }
        return { success: true, count: tasks.length, data: tasks };
      }
    },
    create: async (taskData) => {
      try {
        const res = await fetch(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(taskData),
        });
        return await handleResponse(res);
      } catch {
        const tasks = getLocalData('tasks', INITIAL_TASKS);
        const subs = getLocalData('subjects', INITIAL_SUBJECTS);
        const matchedSub = subs.find((s) => s._id === taskData.subject) || null;

        const newTask = {
          _id: 'task-' + Date.now(),
          ...taskData,
          subject: matchedSub,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        tasks.unshift(newTask);
        setLocalData('tasks', tasks);
        return { success: true, data: newTask };
      }
    },
    update: async (id, taskData) => {
      try {
        const res = await fetch(`${BASE_URL}/tasks/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(taskData),
        });
        return await handleResponse(res);
      } catch {
        const tasks = getLocalData('tasks', INITIAL_TASKS);
        const index = tasks.findIndex((t) => t._id === id);
        if (index !== -1) {
          const wasCompleted = tasks[index].status === 'completed';
          tasks[index] = { ...tasks[index], ...taskData };
          let xpAwarded = 0;
          if (!wasCompleted && taskData.status === 'completed') {
            xpAwarded = 15;
            tasks[index].completedAt = new Date().toISOString();
          }
          setLocalData('tasks', tasks);
          return { success: true, data: tasks[index], xpAwarded };
        }
        throw new Error('Task not found');
      }
    },
    delete: async (id) => {
      try {
        const res = await fetch(`${BASE_URL}/tasks/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        let tasks = getLocalData('tasks', INITIAL_TASKS);
        tasks = tasks.filter((t) => t._id !== id);
        setLocalData('tasks', tasks);
        return { success: true, message: 'Task deleted' };
      }
    },
  },

  // Sessions
  sessions: {
    log: async (sessionData) => {
      try {
        const res = await fetch(`${BASE_URL}/sessions`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(sessionData),
        });
        return await handleResponse(res);
      } catch {
        const sessions = getLocalData('sessions', INITIAL_SESSIONS);
        const subs = getLocalData('subjects', INITIAL_SUBJECTS);
        const matchedSub = subs.find((s) => s._id === sessionData.subject) || null;

        const duration = Number(sessionData.durationMinutes) || 25;
        const xpEarned = Math.max(5, duration + (sessionData.timerType === 'pomodoro' ? 5 : 0));

        const newSession = {
          _id: 'sess-' + Date.now(),
          ...sessionData,
          subject: matchedSub,
          xpEarned,
          completed: true,
          completedAt: new Date().toISOString(),
        };

        sessions.unshift(newSession);
        setLocalData('sessions', sessions);

        // Update local subject minutes
        if (matchedSub) {
          matchedSub.totalStudiedMinutes = (matchedSub.totalStudiedMinutes || 0) + duration;
          const targetMin = (matchedSub.weeklyTargetHours || 5) * 60;
          matchedSub.progressPercent = Math.min(100, Math.round((matchedSub.totalStudiedMinutes / targetMin) * 100));
          const subIdx = subs.findIndex((s) => s._id === matchedSub._id);
          if (subIdx !== -1) subs[subIdx] = matchedSub;
          setLocalData('subjects', subs);
        }

        return {
          success: true,
          data: newSession,
          xpEarned,
          userUpdates: { xp: 470, level: 4, streak: 6 },
        };
      }
    },
    getRecent: async (limit = 10) => {
      try {
        const res = await fetch(`${BASE_URL}/sessions/recent?limit=${limit}`, {
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        const sessions = getLocalData('sessions', INITIAL_SESSIONS);
        return { success: true, count: sessions.slice(0, limit).length, data: sessions.slice(0, limit) };
      }
    },
    delete: async (id) => {
      try {
        const res = await fetch(`${BASE_URL}/sessions/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        let sessions = getLocalData('sessions', INITIAL_SESSIONS);
        sessions = sessions.filter((s) => s._id !== id);
        setLocalData('sessions', sessions);
        return { success: true, message: 'Session deleted' };
      }
    },
  },

  // Analytics
  analytics: {
    getDashboard: async () => {
      try {
        const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
          headers: getHeaders(),
        });
        return await handleResponse(res);
      } catch {
        const sessions = getLocalData('sessions', INITIAL_SESSIONS);
        const tasks = getLocalData('tasks', INITIAL_TASKS);
        const subjects = getLocalData('subjects', INITIAL_SUBJECTS);

        const todayMinutes = 135;
        const weekMinutes = 680;
        const totalMinutes = 1055;

        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const totalTasks = tasks.length;

        const last7DaysActivity = [
          { date: '2026-09-19', dayLabel: 'Sat', minutes: 75, hours: '1.3', sessionsCount: 2 },
          { date: '2026-09-20', dayLabel: 'Sun', minutes: 90, hours: '1.5', sessionsCount: 2 },
          { date: '2026-09-21', dayLabel: 'Mon', minutes: 120, hours: '2.0', sessionsCount: 3 },
          { date: '2026-09-22', dayLabel: 'Tue', minutes: 105, hours: '1.8', sessionsCount: 2 },
          { date: '2026-09-23', dayLabel: 'Wed', minutes: 155, hours: '2.6', sessionsCount: 3 },
          { date: '2026-09-24', dayLabel: 'Thu', minutes: 140, hours: '2.3', sessionsCount: 3 },
          { date: '2026-09-25', dayLabel: 'Fri', minutes: todayMinutes, hours: (todayMinutes / 60).toFixed(1), sessionsCount: 2 },
        ];

        const distributionBySubject = subjects.map((sub) => ({
          name: sub.name,
          color: sub.color,
          minutes: sub.totalStudiedMinutes || 120,
          hours: ((sub.totalStudiedMinutes || 120) / 60).toFixed(1),
          percentage: sub.progressPercent || 30,
        }));

        return {
          success: true,
          data: {
            todayStudyMinutes: todayMinutes,
            todayTargetMinutes: 240,
            dailyGoalProgress: Math.min(100, Math.round((todayMinutes / 240) * 100)),
            weekStudyMinutes: weekMinutes,
            totalStudyMinutes: totalMinutes,
            totalStudyHours: (totalMinutes / 60).toFixed(1),
            streak: 5,
            level: 4,
            xp: 420,
            xpProgressInLevel: 20,
            distributionBySubject,
            last7DaysActivity,
            tasksSummary: {
              total: totalTasks,
              completed: completedTasks,
              pending: totalTasks - completedTasks,
              completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            },
          },
        };
      }
    },
  },
};
