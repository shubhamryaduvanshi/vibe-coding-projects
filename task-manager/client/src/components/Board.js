import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from './Column';
import TaskForm from './TaskForm';
import BoardForm from './BoardForm';
import { useKanban } from '../context/KanbanContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useAuth } from '../context/AuthContext';

const Board = () => {
  const { 
    currentBoard, 
    tasks, 
    getTasksByStatus,
    createTask,
    fetchUsers,
    users,
    addTaskComment,
    deleteTaskComment,
    updateTask,
    deleteTask,
    updateBoard,
    deleteBoard,
    loading,
    error 
  } = useKanban();
  const { user: currentUser } = useAuth();
  
  const { handleDragEnd } = useDragAndDrop();
  const [activeTask, setActiveTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [taskStatus, setTaskStatus] = useState('Todo');

  useEffect(() => {
    fetchUsers().catch(() => {});
  }, [fetchUsers]);

  useEffect(() => {
    if (!editingTask) {
      return;
    }

    const freshTask = tasks.find((task) => task._id === editingTask._id);
    if (freshTask) {
      setEditingTask(freshTask);
    }
  }, [editingTask, tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = (status) => {
    setTaskStatus(status);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
    } else {
      await createTask({
        ...taskData,
        boardId: currentBoard._id
      });
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleSaveBoard = async (boardData) => {
    await updateBoard(currentBoard._id, boardData);
    setShowBoardForm(false);
  };

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to delete this board? All tasks will be deleted.')) {
      await deleteBoard(currentBoard._id);
    }
  };

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Board Selected</h2>
          <p className="text-gray-600">Please select or create a board to get started.</p>
        </div>
      </div>
    );
  }

  const columns = currentBoard.columns || ['Todo', 'In Progress', 'Done'];

  return (
    <div className="p-3 sm:p-6">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Board Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{currentBoard.name}</h1>
            <p className="text-gray-600 mt-1">{currentBoard.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowBoardForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Edit Board
            </button>
            <button
              onClick={handleDeleteBoard}
              className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Delete Board
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 text-gray-600 sm:flex-row sm:items-center">
          <span className="mr-0 sm:mr-4">Columns: {columns.join(', ')}</span>
          <span className="text-sm">Total Tasks: {tasks.length}</span>
        </div>
      </div>

      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => {
          if (event.active.data.current?.type === 'task') {
            setActiveTask(event.active.data.current.task);
          }
        }}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 sm:gap-6">
          {columns.map((column) => (
            <Column
              key={column}
              status={column}
              title={column}
              tasks={getTasksByStatus(column)}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="p-4 opacity-90 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-bold">{activeTask.title}</h3>
              <p className="text-sm text-gray-600">{activeTask.description}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="modal-backdrop items-start overflow-y-auto py-8 md:items-center">
          <div className="w-full max-w-6xl rounded-[32px] border border-slate-200 bg-white shadow-2xl">
            <TaskForm
              task={editingTask}
              onSave={handleSaveTask}
              onAddComment={async (taskId, body) => {
                const updatedTask = await addTaskComment(taskId, body);
                setEditingTask(updatedTask);
                return updatedTask;
              }}
              onDeleteComment={async (taskId, commentId) => {
                const updatedTask = await deleteTaskComment(taskId, commentId);
                setEditingTask(updatedTask);
                return updatedTask;
              }}
              currentUserId={currentUser?._id}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              status={taskStatus}
              users={users}
            />
          </div>
        </div>
      )}

      {/* Board Form Modal */}
      {showBoardForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <BoardForm
              board={currentBoard}
              onSave={handleSaveBoard}
              onCancel={() => setShowBoardForm(false)}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-xs rounded-xl bg-white p-6 shadow-2xl">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
