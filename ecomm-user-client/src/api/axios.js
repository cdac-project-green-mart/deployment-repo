import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth: Bearer token + X-User-Id (gateway also sets these from JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const u = JSON.parse(user);
      const userId = u.id ?? u._id ?? u.email;
      if (userId) config.headers['X-User-Id'] = String(userId);
    } catch (_) { }
  }
  return config;
});

// On 401: clear auth so UI reflects logged-out state (token expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('authChanged'));
      } catch (_) { }
    }
    return Promise.reject(err);
  }
);

export default api;
