(function () {
  const grid = document.getElementById('contactGrid');
  const countLabel = document.getElementById('countLabel');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');

  const overlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('contactForm');
  const formError = document.getElementById('formError');
  const saveBtn = document.getElementById('saveBtn');

  let contacts = [];
  let editingId = null;

  // --- fetching + rendering -----------------------------------------------------------
  async function loadContacts() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (categoryFilter.value !== 'All') params.set('category', categoryFilter.value);
    params.set('sort', sortSelect.value);

    try {
      const data = await apiRequest(`/contacts?${params.toString()}`);
      contacts = data.contacts;
      renderGrid();
    } catch (err) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">&#9888;</div><h3>Couldn\u2019t load contacts</h3><p>${escapeHtml(err.message)}</p></div>`;
      countLabel.textContent = '';
    }
  }

  function renderGrid() {
    countLabel.textContent = `${contacts.length} contact${contacts.length === 1 ? '' : 's'}`;

    if (!contacts.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="icon">&#128100;</div>
          <h3>No contacts yet</h3>
          <p>Try a different search, or add your first contact.</p>
        </div>`;
      return;
    }

    grid.innerHTML = contacts.map(renderCard).join('');
    bindCardEvents();
  }

  function initials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('');
  }

  function renderCard(c) {
    return `
      <div class="contact-card" data-id="${c._id}">
        <div class="card-top">
          <div style="display:flex; gap:12px; align-items:center; min-width:0;">
            <div class="avatar">${initials(c.name)}</div>
            <div style="min-width:0;">
              <div class="card-name">${escapeHtml(c.name)}</div>
              ${c.company ? `<div class="card-company">${escapeHtml(c.company)}</div>` : ''}
            </div>
          </div>
          <button class="star-btn ${c.favorite ? 'active' : ''}" data-action="favorite" data-id="${c._id}" title="Toggle favorite">${c.favorite ? '\u2605' : '\u2606'}</button>
        </div>

        <span class="category-pill">${escapeHtml(c.category)}</span>

        <div class="card-meta">
          ${c.email ? `<div><span class="lbl">&#9993;</span><span class="val">${escapeHtml(c.email)}</span></div>` : ''}
          ${c.phone ? `<div><span class="lbl">&#9742;</span><span class="val">${escapeHtml(c.phone)}</span></div>` : ''}
          ${c.address ? `<div><span class="lbl">&#8982;</span><span class="val">${escapeHtml(c.address)}</span></div>` : ''}
        </div>

        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${c._id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${c._id}">Delete</button>
        </div>
      </div>`;
  }

  function bindCardEvents() {
    grid.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
    grid.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => deleteContact(btn.dataset.id));
    });
    grid.querySelectorAll('[data-action="favorite"]').forEach((btn) => {
      btn.addEventListener('click', () => toggleFavorite(btn.dataset.id, btn));
    });
  }

  async function toggleFavorite(id, btn) {
    btn.style.pointerEvents = 'none';
    try {
      const { contact } = await apiRequest(`/contacts/${id}/favorite`, { method: 'PATCH' });
      const local = contacts.find((c) => c._id === id);
      if (local) local.favorite = contact.favorite;
      btn.classList.toggle('active', contact.favorite);
      btn.textContent = contact.favorite ? '\u2605' : '\u2606';
    } catch (err) {
      showToast(err.message, true);
    } finally {
      btn.style.pointerEvents = '';
    }
  }

  async function deleteContact(id) {
    const c = contacts.find((x) => x._id === id);
    if (!confirm(`Delete ${c ? c.name : 'this contact'}? This can\u2019t be undone.`)) return;
    try {
      await apiRequest(`/contacts/${id}`, { method: 'DELETE' });
      showToast('Contact deleted.');
      loadContacts();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  // --- modal (add / edit) -----------------------------------------------------------
  function openModal(id) {
    editingId = id || null;
    formError.classList.remove('show');
    form.reset();
    document.getElementById('category').value = 'Other';

    if (editingId) {
      const c = contacts.find((x) => x._id === editingId);
      modalTitle.textContent = 'Edit contact';
      document.getElementById('contactId').value = c._id;
      document.getElementById('name').value = c.name || '';
      document.getElementById('email').value = c.email || '';
      document.getElementById('phone').value = c.phone || '';
      document.getElementById('company').value = c.company || '';
      document.getElementById('category').value = c.category || 'Other';
      document.getElementById('address').value = c.address || '';
      document.getElementById('notes').value = c.notes || '';
    } else {
      modalTitle.textContent = 'Add contact';
      document.getElementById('contactId').value = '';
    }

    overlay.classList.add('show');
    document.getElementById('name').focus();
  }

  function closeModal() {
    overlay.classList.remove('show');
  }

  document.getElementById('addBtn').addEventListener('click', () => openModal(null));
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.remove('show');

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      company: document.getElementById('company').value.trim(),
      category: document.getElementById('category').value,
      address: document.getElementById('address').value.trim(),
      notes: document.getElementById('notes').value.trim(),
    };

    if (!payload.name) {
      formError.textContent = 'Name is required.';
      formError.classList.add('show');
      return;
    }
    if (!payload.email && !payload.phone) {
      formError.textContent = 'Provide at least an email or a phone number.';
      formError.classList.add('show');
      return;
    }

    saveBtn.classList.add('loading');
    saveBtn.disabled = true;

    try {
      if (editingId) {
        await apiRequest(`/contacts/${editingId}`, { method: 'PUT', body: payload });
        showToast('Contact updated.');
      } else {
        await apiRequest('/contacts', { method: 'POST', body: payload });
        showToast('Contact added.');
      }
      closeModal();
      loadContacts();
    } catch (err) {
      formError.textContent = err.message;
      formError.classList.add('show');
    } finally {
      saveBtn.classList.remove('loading');
      saveBtn.disabled = false;
    }
  });

  // --- toolbar -----------------------------------------------------------
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadContacts, 300);
  });
  categoryFilter.addEventListener('change', loadContacts);
  sortSelect.addEventListener('change', loadContacts);

  loadContacts();
})();
