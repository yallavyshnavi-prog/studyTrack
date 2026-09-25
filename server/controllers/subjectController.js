const Subject = require('../models/Subject');
const StudySession = require('../models/StudySession');

// @desc    Get all subjects for user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Calculate total minutes studied per subject
    const sessions = await StudySession.find({ user: req.user._id });
    const minutesBySubject = {};
    sessions.forEach((s) => {
      if (s.subject) {
        const subId = s.subject.toString();
        minutesBySubject[subId] = (minutesBySubject[subId] || 0) + (s.durationMinutes || 0);
      }
    });

    const enrichedSubjects = subjects.map((sub) => {
      const totalStudiedMinutes = minutesBySubject[sub._id.toString()] || 0;
      const targetMinutes = (sub.weeklyTargetHours || 5) * 60;
      const progressPercent = Math.min(100, Math.round((totalStudiedMinutes / targetMinutes) * 100));

      return {
        ...sub.toObject(),
        totalStudiedMinutes,
        progressPercent,
      };
    });

    return res.json({ success: true, count: enrichedSubjects.length, data: enrichedSubjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    const { name, color, weeklyTargetHours, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a subject name' });
    }

    const subject = await Subject.create({
      user: req.user._id,
      name,
      color: color || '#6366f1',
      weeklyTargetHours: weeklyTargetHours || 5,
      description: description || '',
    });

    return res.status(201).json({ success: true, data: subject });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  try {
    let subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const { name, color, weeklyTargetHours, description } = req.body;
    if (name) subject.name = name;
    if (color) subject.color = color;
    if (weeklyTargetHours !== undefined) subject.weeklyTargetHours = weeklyTargetHours;
    if (description !== undefined) subject.description = description;

    await subject.save();

    return res.json({ success: true, data: subject });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    return res.json({ success: true, message: 'Subject removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
