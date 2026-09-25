const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, subject } = req.query;
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;

    const tasks = await Task.find(filter)
      .populate('subject', 'name color')
      .sort({ dueDate: 1, createdAt: -1 });

    return res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, subject, priority, dueDate, estimatedMinutes } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide task title' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      subject: subject || null,
      priority: priority || 'medium',
      dueDate: dueDate || new Date(+new Date() + 2 * 24 * 60 * 60 * 1000),
      estimatedMinutes: estimatedMinutes || 45,
    });

    const populatedTask = await Task.findById(task._id).populate('subject', 'name color');

    return res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task (and award XP on completion)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const wasCompleted = task.status === 'completed';
    const fieldsToUpdate = ['title', 'description', 'subject', 'priority', 'status', 'dueDate', 'estimatedMinutes'];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // Check if task transitioned to completed
    let xpAwarded = 0;
    if (!wasCompleted && task.status === 'completed') {
      task.completedAt = new Date();
      xpAwarded = 15;

      // Award XP to user
      const user = await User.findById(req.user._id);
      if (user) {
        user.xp = (user.xp || 0) + xpAwarded;
        user.level = Math.floor(user.xp / 100) + 1;
        await user.save();
      }
    } else if (wasCompleted && task.status !== 'completed') {
      task.completedAt = null;
    }

    await task.save();
    const populated = await Task.findById(task._id).populate('subject', 'name color');

    return res.json({
      success: true,
      data: populated,
      xpAwarded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
