const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};
