import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set auth header token if stored in localStorage
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const api = {
  // Auth API
  login: (email, password) => axios.post(`${API_URL}/login`, { email, password }),
  logout: () => axios.post(`${API_URL}/logout`),
  getProfile: () => axios.get(`${API_URL}/profile`),

  // Sessions API
  startSession: (data) => axios.post(`${API_URL}/start-session`, data),
  stopSession: (data) => axios.post(`${API_URL}/stop-session`, data),
  uploadSpeech: (formData) => axios.post(`${API_URL}/speech`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  extractKeywords: (sessionId, text) => axios.post(`${API_URL}/extract-keyword`, { sessionId, text }),
  searchImage: (keyword) => axios.get(`${API_URL}/image`, { params: { keyword } }),
  generateImage: (sessionId, keyword) => axios.post(`${API_URL}/generate-image`, { sessionId, keyword }),
  overrideImage: (sessionId, keyword, imageUrl) => axios.post(`${API_URL}/override-image`, { sessionId, keyword, imageUrl }),
  removeImage: (sessionId) => axios.delete(`${API_URL}/remove-image`, { data: { sessionId } }),
  getHistory: (params) => axios.get(`${API_URL}/history`, { params }),

  // Admin / Teachers API
  getTeachers: () => axios.get(`${API_URL}/teachers`),
  createTeacher: (data) => axios.post(`${API_URL}/teachers`, data),
  deleteTeacher: (id) => axios.delete(`${API_URL}/teachers/${id}`),
  getAnalytics: () => axios.get(`${API_URL}/analytics`),
  getLogs: () => axios.get(`${API_URL}/logs`)
};
