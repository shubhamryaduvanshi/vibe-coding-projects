const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

const sanitizeUser = (userDoc) => ({
  _id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    const token = buildToken(user._id.toString());
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = buildToken(user._id.toString());
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login' });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};
