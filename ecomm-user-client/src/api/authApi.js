import api from './axios';

/**
 * Auth API – aligned with imnits45-deployment-repo and backend-auth-service.
 * All paths are relative; baseURL from axios.js is '/api', so full paths are /api/auth/*.
 *
 * imnits45: POST /api/auth/register { name, email, password, role }
 *           POST /api/auth/login { email, password } → { success, token, user }
 * .NET:     POST /api/auth/signup { email, password } → { accessToken }
 *           POST /api/auth/login { email, password } → { accessToken }
 */
export const register = async (name, email, password, role = 'CUSTOMER') => {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const validateToken = async () => {
  const { data } = await api.get('/auth/validate');
  return data;
};

/**
 * Normalize error from backend to a single user-friendly string.
 */
export function getAuthErrorMessage(err) {
  if (!err) return 'Something went wrong.';
  const res = err.response;
  if (!res) return err.message || 'Unable to connect. Please try again.';
  const status = res.status;
  const body = res.data;
  const contentType = res.headers?.['content-type'] || '';

  // If backend returns HTML (e.g. "Cannot POST /api/auth/login"), don't show raw HTML
  if (typeof body === 'string' && (contentType.includes('text/html') || body.trimStart().startsWith('<'))) {
    if (body.includes('Cannot POST') || body.includes('Cannot GET')) {
      return 'Auth service unavailable. Make sure the API gateway and auth service are running.';
    }
    return 'Server returned an error. Check that the API gateway and auth service are running.';
  }

  const message = typeof body === 'string' ? body : body?.message;
  const data = body?.data;

  if (status === 401) return message || 'Invalid email or password.';
  if (status === 409) return message || 'Email already registered.';
  if (status === 400) {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const parts = Object.entries(data).map(([field, msg]) => `${field}: ${msg}`);
      return parts.length ? parts.join(' ') : (message || 'Invalid input.');
    }
    return message || 'Invalid input.';
  }
  if (status >= 500) return message || 'Server error. Please try again later.';
  return message || 'Something went wrong.';
}
