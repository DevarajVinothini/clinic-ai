import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const appointmentsAPI = {
  list: () => API.get('/appointments'),
  create: (data) => API.post('/appointments', data),
  schedule: (data) => API.post('/appointments/schedule', data),
  listStaff: () => API.get('/appointments/staff'),
  updateStatus: (id, status) => API.patch(`/appointments/${id}/status`, { status }),
  predict: (features) => API.post('/appointments/predict', features),
};

export const chatAPI = {
  history: () => API.get('/chat/history'),
  send: (message) => API.post('/chat/message', { message }),
  clear: () => API.delete('/chat/history'),
};

export const patientsAPI = {
  list: () => API.get('/patients'),
  stats: () => API.get('/patients/stats'),
};

export const remindersAPI = {
  list: () => API.get('/reminders'),
  markRead: (id) => API.patch(`/reminders/${id}/read`),
};

export const medsAPI = {
  list: () => API.get('/medications'),
  create: (data) => API.post('/medications', data),
  log: (id, status) => API.post(`/medications/${id}/log`, { status }),
};

export default API;
