const Board = require('../models/Board');
const Task = require('../models/Task');

// Get all boards
exports.getAllBoards = async (req, res) => {
  try {
    const boards = await Board.find().sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
};

// Create a new board
exports.createBoard = async (req, res) => {
  try {
    const { name, description, columns } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const board = new Board({
      name,
      description: description || '',
      columns: columns || ['Todo', 'In Progress', 'Done']
    });

    const savedBoard = await board.save();
    res.status(201).json(savedBoard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board' });
  }
};

// Get a single board with its tasks
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Get tasks for this board, sorted by position
    const tasks = await Task.find({ boardId: req.params.id })
      .sort({ position: 1 })
      .populate([
        { path: 'assignee', select: '_id name email' },
        { path: 'comments.author', select: '_id name email' }
      ]);
    
    res.json({
      ...board.toObject(),
      tasks
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board' });
  }
};

// Update a board
exports.updateBoard = async (req, res) => {
  try {
    const { name, description, columns } = req.body;
    
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { name, description, columns, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update board' });
  }
};

// Delete a board and its tasks
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Delete all tasks associated with this board
    await Task.deleteMany({ boardId: req.params.id });
    
    // Delete the board
    await Board.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Board and associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete board' });
  }
};