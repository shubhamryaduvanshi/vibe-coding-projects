const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  columns: {
    type: [String],
    default: ['Todo', 'In Progress', 'Done']
  },
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
boardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;