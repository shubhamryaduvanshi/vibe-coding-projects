const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

// GET /api/tasks - Get all tasks for a board (requires boardId query param)
router.get('/', taskController.getTasks);

// POST /api/tasks - Create a new task
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', taskController.deleteTask);

// POST /api/tasks/reorder - Reorder tasks (drag and drop)
router.post('/reorder', taskController.reorderTasks);

// POST /api/tasks/:id/comments - Add comment to a task
router.post('/:id/comments', taskController.addComment);

// DELETE /api/tasks/:id/comments/:commentId - Remove a comment from a task
router.delete('/:id/comments/:commentId', taskController.deleteComment);

module.exports = router;