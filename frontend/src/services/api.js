import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getAllUsers: () => api.get('/auth/users'),
};

// Projects
export const projectAPI = {
  getAll: () => api.get('/projects'),
  getStats: () => api.get('/projects/stats'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
};

// Tasks
export const taskAPI = {
  getByProject: (projectId, params) => api.get(`/tasks/project/${projectId}`, { params }),
  getMyTasks: () => api.get('/tasks/my'),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.put(`/tasks/${id}/status`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, data) => api.post(`/tasks/${id}/comment`, data),
};

// AI
export const aiAPI = {
  submitStandup: (data) => api.post('/ai/standup', data),
  getStandups: (projectId) => api.get(`/ai/standups/${projectId}`),
  prioritizeTasks: (data) => api.post('/ai/prioritize-tasks', data),
  predictRisk: (data) => api.post('/ai/predict-risk', data),
  generateTasks: (data) => api.post('/ai/generate-tasks', data),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
