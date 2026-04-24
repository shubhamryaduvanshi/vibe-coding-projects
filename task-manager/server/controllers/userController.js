const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('_id name email').sort({ name: 1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};
