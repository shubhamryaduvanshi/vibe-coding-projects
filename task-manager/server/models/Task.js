const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
    required: true,
    default: 0
  },
  comments: [
    {
      body: {
        type: String,
        required: true,
        trim: true
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  activityLog: [
    {
      type: {
        type: String,
        enum: ['created', 'assignee_changed', 'comment_added', 'comment_deleted'],
        required: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      metadata: {
        previousAssignee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null
        },
        newAssignee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null
        },
        commentBody: {
          type: String,
          default: ''
        }
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create index for efficient queries by board and status
taskSchema.index({ boardId: 1, status: 1, position: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
