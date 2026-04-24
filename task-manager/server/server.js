const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Basic route for health check
app.get('/', (req, res) => {
  res.json({ message: 'Kanban Board API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});