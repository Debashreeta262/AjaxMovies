(function () {
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'employee-dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  function setError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.toggle('show', Boolean(msg));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setError('');

    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) {
      setError('Enter both your email and password.');
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // The client never picks the role — the server reads it off the
      // account and hands back a token scoped to whatever that account is.
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
      });

      Auth.setSession(data.token, data.user);
      window.location.href = data.user.role === 'admin' ? 'admin-dashboard.html' : 'employee-dashboard.html';
    } catch (err) {
      setError(err.message);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
})();
