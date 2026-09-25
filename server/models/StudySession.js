const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0.1,
    },
    timerType: {
      type: String,
      enum: ['pomodoro', 'short-break', 'long-break', 'stopwatch'],
      default: 'pomodoro',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    xpEarned: {
      type: Number,
      default: 25,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudySession', studySessionSchema);
