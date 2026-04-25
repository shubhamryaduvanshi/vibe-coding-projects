const mongoose = require('mongoose');

const worklogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0.25,
    max: 24
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
worklogSchema.index({ taskId: 1, date: -1 });
worklogSchema.index({ userId: 1, date: -1 });
worklogSchema.index({ date: -1 });

// Virtual for formatted date
worklogSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

const Worklog = mongoose.model('Worklog', worklogSchema);

module.exports = Worklog;