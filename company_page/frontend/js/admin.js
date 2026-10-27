(function () {
  const user = guardPage('admin');
  if (!user) return;

  document.getElementById('whoami').textContent = user.email;
  document.getElementById('greeting').textContent = `Welcome, ${user.name.split(' ')[0]}`;

  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    Auth.clearSession();
    window.location.href = 'index.html';
  });

  const tbody = document.getElementById('employeeTableBody');
  const statCards = document.getElementById('statCards');

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function renderStats(users) {
    const employees = users.filter((u) => u.role === 'employee');
    const withAccess = employees.filter((u) => u.directoryAccess).length;
    const suspended = users.filter((u) => u.status === 'suspended').length;

    statCards.innerHTML = `
      <div class="info-card"><div class="k">Total accounts</div><div class="v">${users.length}</div></div>
      <div class="info-card"><div class="k">Employees with directory access</div><div class="v">${withAccess} / ${employees.length}</div></div>
      <div class="info-card"><div class="k">Suspended</div><div class="v">${suspended}</div></div>
    `;
  }

  function renderRow(u) {
    const isSelf = u.id === user.id;
    const statusPill = u.status === 'active'
      ? '<span class="pill pill-good">Active</span>'
      : '<span class="pill pill-bad">Suspended</span>';

    const accessCell = u.role === 'admin'
      ? '<span class="pill pill-muted">N/A</span>'
      : `<div class="toggle ${u.directoryAccess ? 'on' : ''}" data-id="${u.id}" title="Toggle directory access"><div class="dot"></div></div>`;

    const actions = isSelf
      ? '<span class="pill pill-muted">You</span>'
      : `
        <button class="btn btn-ghost btn-sm" data-action="status" data-id="${u.id}" data-status="${u.status === 'active' ? 'suspended' : 'active'}">
          ${u.status === 'active' ? 'Suspend' : 'Reactivate'}
        </button>
        <button class="btn btn-danger btn-sm" data-action="delete" data-id="${u.id}">Delete</button>
      `;

    return `
      <tr data-row="${u.id}">
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="pill ${u.role === 'admin' ? 'pill-good' : 'pill-muted'}">${u.role}</span></td>
        <td>${escapeHtml(u.department)}</td>
        <td>${escapeHtml(u.designation)}</td>
        <td>${statusPill}</td>
        <td>${accessCell}</td>
        <td style="white-space:nowrap; display:flex; gap:8px;">${actions}</td>
      </tr>`;
  }

  let cache = [];

  async function loadEmployees() {
    try {
      const { users } = await apiRequest('/admin/employees');
      cache = users;
      renderStats(users);
      tbody.innerHTML = users.map(renderRow).join('');
      bindRowEvents();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">${escapeHtml(err.message)}</div></td></tr>`;
    }
  }

  function bindRowEvents() {
    tbody.querySelectorAll('.toggle').forEach((toggle) => {
      toggle.addEventListener('click', async () => {
        const id = toggle.dataset.id;
        const nextValue = !toggle.classList.contains('on');
        toggle.style.pointerEvents = 'none';
        try {
          await apiRequest(`/admin/employees/${id}/access`, {
            method: 'PATCH',
            body: { directoryAccess: nextValue },
          });
          toggle.classList.toggle('on', nextValue);
          showToast(nextValue ? 'Directory access granted.' : 'Directory access revoked.');
          const rec = cache.find((u) => u.id === id);
          if (rec) rec.directoryAccess = nextValue;
          renderStats(cache);
        } catch (err) {
          showToast(err.message, true);
        } finally {
          toggle.style.pointerEvents = '';
        }
      });
    });

    tbody.querySelectorAll('[data-action="status"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const status = btn.dataset.status;
        btn.disabled = true;
        try {
          await apiRequest(`/admin/employees/${id}/status`, { method: 'PATCH', body: { status } });
          showToast(status === 'suspended' ? 'Account suspended.' : 'Account reactivated.');
          loadEmployees();
        } catch (err) {
          showToast(err.message, true);
          btn.disabled = false;
        }
      });
    });

    tbody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this account permanently?')) return;
        const id = btn.dataset.id;
        btn.disabled = true;
        try {
          await apiRequest(`/admin/employees/${id}`, { method: 'DELETE' });
          showToast('Account removed.');
          loadEmployees();
        } catch (err) {
          showToast(err.message, true);
          btn.disabled = false;
        }
      });
    });
  }

  loadEmployees();
})();
