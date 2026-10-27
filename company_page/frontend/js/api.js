// Central place for talking to the backend. Change API_BASE if your
// server isn't running on the default local port.
const API_BASE = 'http://localhost:5000/api';

const Auth = {
  getToken() {
    return localStorage.getItem('portal_token');
  },
  getUser() {
    const raw = localStorage.getItem('portal_user');
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem('portal_token', token);
    localStorage.setItem('portal_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
  },
  isLoggedIn() {
    return Boolean(this.getToken());
  },
};

// Wraps fetch: attaches the bearer token, parses JSON, and throws a
// readable Error on non-2xx responses so callers can just try/catch.
async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && Auth.getToken()) {
    headers.Authorization = `Bearer ${Auth.getToken()}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Can\u2019t reach the server. Is the backend running?');
  }

  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    /* empty body is fine */
  }

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.locked = data.locked || false;
    throw err;
  }
  return data;
}

// Redirects unauthenticated users, and users on the wrong role's page,
// back to a sensible place. Call at the top of dashboard pages.
function guardPage(requiredRole) {
  const user = Auth.getUser();
  if (!Auth.isLoggedIn() || !user) {
    window.location.href = 'login.html';
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'employee-dashboard.html';
    return null;
  }
  return user;
}

function showToast(message, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle('err', isError);
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}
