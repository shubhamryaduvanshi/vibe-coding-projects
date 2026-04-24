const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

// GET /api/boards - Get all boards
router.get('/', boardController.getAllBoards);

// POST /api/boards - Create a new board
router.post('/', boardController.createBoard);

// GET /api/boards/:id - Get a single board with its tasks
router.get('/:id', boardController.getBoard);

// PUT /api/boards/:id - Update a board
router.put('/:id', boardController.updateBoard);

// DELETE /api/boards/:id - Delete a board
router.delete('/:id', boardController.deleteBoard);

module.exports = router;