const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);
router.get('/', userController.getUsers);

module.exports = router;
