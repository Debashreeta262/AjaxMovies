(function () {
  const user = guardPage('employee');
  if (!user) return;

  document.getElementById('whoami').textContent = user.email;
  document.getElementById('greeting').textContent = `Welcome, ${user.name.split(' ')[0]}`;

  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    Auth.clearSession();
    window.location.href = 'index.html';
  });

  // --- tabs -----------------------------------------------------------
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.panel}`).classList.add('active');
      if (tab.dataset.panel === 'directory') loadDirectory();
    });
  });

  // --- own profile -----------------------------------------------------------
  async function loadProfile() {
    const cardsEl = document.getElementById('profileCards');
    try {
      const { user: me } = await apiRequest('/employees/me');
      cardsEl.innerHTML = `
        ${card('Name', me.name)}
        ${card('Email', me.email)}
        ${card('Department', me.department)}
        ${card('Designation', me.designation)}
        ${card('Phone', me.phone || '\u2014')}
        ${card('Directory access', me.directoryAccess
          ? '<span class="pill pill-good">Granted</span>'
          : '<span class="pill pill-muted">Not yet granted</span>')}
      `;
    } catch (err) {
      cardsEl.innerHTML = `<div class="empty-state">Couldn\u2019t load your profile: ${escapeHtml(err.message)}</div>`;
    }
  }

  function card(label, value) {
    return `<div class="info-card"><div class="k">${label}</div><div class="v">${value}</div></div>`;
  }

  // --- directory (gated by admin) -----------------------------------------------------------
  let directoryLoaded = false;
  async function loadDirectory() {
    if (directoryLoaded) return;
    const el = document.getElementById('directoryContent');
    try {
      const data = await apiRequest('/employees/directory');
      directoryLoaded = true;

      if (!data.colleagues.length) {
        el.innerHTML = `<div class="empty-state">No other employees yet.</div>`;
        return;
      }

      el.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Department</th><th>Designation</th></tr></thead>
            <tbody>
              ${data.colleagues.map((c) => `
                <tr>
                  <td>${escapeHtml(c.name)}</td>
                  <td>${escapeHtml(c.department)}</td>
                  <td>${escapeHtml(c.designation)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (err) {
      if (err.locked) {
        el.innerHTML = `
          <div class="locked-box">
            <div class="icon">&#128274;</div>
            <p style="margin:0 0 4px; color:var(--paper)">Directory locked</p>
            <p style="margin:0; max-width:40ch; margin:0 auto;">${escapeHtml(err.message)}</p>
          </div>`;
      } else {
        el.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
      }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  loadProfile();
})();
