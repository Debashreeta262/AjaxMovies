(function () {
  // Already signed in? Don't sit on the registration page.
  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    window.location.href = user.role === 'admin' ? 'admin-dashboard.html' : 'employee-dashboard.html';
    return;
  }

  const form = document.getElementById('registerForm');
  const errorBox = document.getElementById('formError');
  const successBox = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  function setError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.toggle('show', Boolean(msg));
    if (msg) successBox.classList.remove('show');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setError('');

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const department = form.department.value.trim() || 'Unassigned';
    const designation = form.designation.value.trim() || 'Staff';
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!name || !email || !password) {
      setError('Please fill in your name, email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password needs to be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don\u2019t match.');
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        auth: false,
        body: { name, email, password, department, designation, phone },
      });

      Auth.setSession(data.token, data.user);
      successBox.textContent = 'Account created! Taking you to your dashboard\u2026';
      successBox.classList.add('show');
      setTimeout(() => (window.location.href = 'employee-dashboard.html'), 700);
    } catch (err) {
      setError(err.message);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
})();
