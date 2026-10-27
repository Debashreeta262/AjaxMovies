// Change this if your backend isn't running on the default local port.
const API_BASE = 'http://localhost:5000/api';

async function apiRequest(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Can\u2019t reach the server. Is the backend running?');
  }

  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    /* empty body is fine, e.g. some DELETE responses */
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
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
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}
