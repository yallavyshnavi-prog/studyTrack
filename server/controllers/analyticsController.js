const StudySession = require('../models/StudySession');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get dashboard metrics, charts data & progress analytics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // 1. Time range calculations
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf7DaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    startOf7DaysAgo.setHours(0, 0, 0, 0);

    // Fetch all user sessions
    const allSessions = await StudySession.find({ user: userId }).populate('subject', 'name color');
    const allTasks = await Task.find({ user: userId });
    const allSubjects = await Subject.find({ user: userId });

    // 2. Today's study minutes
    const todaySessions = allSessions.filter(
      (s) => new Date(s.completedAt) >= startOfToday
    );
    const todayStudyMinutes = Math.round(
      todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
    );

    // 3. Weekly study minutes
    const weekSessions = allSessions.filter(
      (s) => new Date(s.completedAt) >= startOf7DaysAgo
    );
    const weekStudyMinutes = Math.round(
      weekSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
    );

    // 4. Total all-time minutes
    const totalStudyMinutes = Math.round(
      allSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
    );

    // 5. Subject distribution breakdown
    const subjectMap = {};
    allSubjects.forEach((sub) => {
      subjectMap[sub._id.toString()] = {
        name: sub.name,
        color: sub.color,
        minutes: 0,
      };
    });

    allSessions.forEach((s) => {
      if (s.subject && subjectMap[s.subject._id ? s.subject._id.toString() : s.subject.toString()]) {
        const id = s.subject._id ? s.subject._id.toString() : s.subject.toString();
        subjectMap[id].minutes += s.durationMinutes || 0;
      } else {
        if (!subjectMap['other']) {
          subjectMap['other'] = { name: 'General Focus', color: '#94a3b8', minutes: 0 };
        }
        subjectMap['other'].minutes += s.durationMinutes || 0;
      }
    });

    const totalMinutesForDist = totalStudyMinutes || 1;
    const distributionBySubject = Object.values(subjectMap)
      .filter((s) => s.minutes > 0)
      .map((s) => ({
        name: s.name,
        color: s.color,
        minutes: Math.round(s.minutes),
        hours: (s.minutes / 60).toFixed(1),
        percentage: Math.min(100, Math.round((s.minutes / totalMinutesForDist) * 100)),
      }));

    // 6. Last 7 Days Activity Heatmap/Bar chart
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7DaysActivity = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const daySessions = allSessions.filter((s) => {
        const sDate = new Date(s.completedAt);
        return sDate >= startOfDay && sDate <= endOfDay;
      });

      const dayMinutes = Math.round(
        daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
      );

      last7DaysActivity.push({
        date: d.toISOString().split('T')[0],
        dayLabel: daysOfWeek[d.getDay()],
        minutes: dayMinutes,
        hours: (dayMinutes / 60).toFixed(1),
        sessionsCount: daySessions.length,
      });
    }

    // 7. Task completion rates
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 8. Daily Goal Progress
    const targetDailyMinutes = (user.targetDailyHours || 4) * 60;
    const dailyGoalProgress = Math.min(
      100,
      Math.round((todayStudyMinutes / targetDailyMinutes) * 100)
    );

    // 9. XP progress to next level
    const currentLevel = user.level || 1;
    const currentXP = user.xp || 0;
    const xpForNextLevel = currentLevel * 100;
    const xpProgressInLevel = currentXP % 100;

    return res.json({
      success: true,
      data: {
        todayStudyMinutes,
        todayTargetMinutes: targetDailyMinutes,
        dailyGoalProgress,
        weekStudyMinutes,
        totalStudyMinutes,
        totalStudyHours: (totalStudyMinutes / 60).toFixed(1),
        streak: user.streak || 1,
        level: currentLevel,
        xp: currentXP,
        xpProgressInLevel,
        distributionBySubject,
        last7DaysActivity,
        tasksSummary: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          completionRate,
        },
      },
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
};
