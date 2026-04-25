import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const TOKEN_KEY = 'kanban_auth_token';

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(errorMessage));
  }
);

// Board API
export const boardService = {
  getAll: () => api.get('/boards'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (boardData) => api.post('/boards', boardData),
  update: (id, boardData) => api.put(`/boards/${id}`, boardData),
  delete: (id) => api.delete(`/boards/${id}`),
};

// Task API
export const taskService = {
  getByBoardId: (boardId) => api.get('/tasks', { params: { boardId } }),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (reorderData) => api.post('/tasks/reorder', reorderData),
  addComment: (id, body) => api.post(`/tasks/${id}/comments`, { body }),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me')
};

export const userService = {
  getAll: () => api.get('/users')
};

// Report API
export const reportService = {
  getTimeReport: (params) => api.get('/reports/time', { params }),
  getTaskWorklogSummary: (taskId) => api.get(`/reports/task/${taskId}`),
  getUserWorklogSummary: (userId) => api.get(`/reports/user/${userId}`),
  getDateRangeReport: (start, end) => api.get('/reports/range', { params: { start, end } })
};

// Worklog API
export const worklogService = {
  create: (worklogData) => api.post('/worklogs', worklogData),
  getByTask: (taskId) => api.get(`/worklogs/task/${taskId}`),
  getByUser: () => api.get('/worklogs/user'),
  update: (id, worklogData) => api.put(`/worklogs/${id}`, worklogData),
  delete: (id) => api.delete(`/worklogs/${id}`)
};

export default api;