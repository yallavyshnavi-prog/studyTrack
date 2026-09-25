const StudySession = require('../models/StudySession');
const User = require('../models/User');

// @desc    Log a completed study/focus session
// @route   POST /api/sessions
// @access  Private
const logSession = async (req, res) => {
  try {
    const { durationMinutes, subject, timerType, notes } = req.body;

    if (!durationMinutes || durationMinutes <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid session duration' });
    }

    // Calculate XP: e.g. 1 XP per minute of focus, bonus for pomodoro
    const baseXP = Math.round(Number(durationMinutes));
    const bonusXP = timerType === 'pomodoro' ? 5 : 0;
    const xpEarned = Math.max(5, baseXP + bonusXP);

    const session = await StudySession.create({
      user: req.user._id,
      subject: subject || null,
      durationMinutes: Number(durationMinutes),
      timerType: timerType || 'pomodoro',
      notes: notes || '',
      xpEarned,
      completed: true,
      completedAt: new Date(),
    });

    // Update user XP, Level, and Streak
    const user = await User.findById(req.user._id);
    if (user) {
      user.xp = (user.xp || 0) + xpEarned;
      user.level = Math.floor(user.xp / 100) + 1;

      const now = new Date();
      const lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
      if (lastDate) {
        const diffTime = Math.abs(now - lastDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
      user.lastStudyDate = now;
      await user.save();
    }

    const populatedSession = await StudySession.findById(session._id).populate('subject', 'name color');

    return res.status(201).json({
      success: true,
      data: populatedSession,
      xpEarned,
      userUpdates: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Session logging error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent study sessions
// @route   GET /api/sessions/recent
// @access  Private
const getRecentSessions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const sessions = await StudySession.find({ user: req.user._id })
      .populate('subject', 'name color')
      .sort({ completedAt: -1 })
      .limit(limit);

    return res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete study session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    return res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  logSession,
  getRecentSessions,
  deleteSession,
};
