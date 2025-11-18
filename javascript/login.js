document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const emailEl = document.getElementById('login-email');
  const passEl = document.getElementById('login-password');
  const messages = document.getElementById('login-messages');

  function show(msg, isError = true) {
    messages.innerHTML = '';
    const div = document.createElement('div');
    div.style.padding = '10px 12px';
    div.style.borderRadius = '8px';
    div.style.background = isError ? 'rgba(220,20,60,0.04)' : 'rgba(16,128,16,0.06)';
    div.style.color = isError ? '#8b0000' : '#0a5';
    div.textContent = msg;
    messages.appendChild(div);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) {
      show('Please enter both email and password.');
      return;
    }

    // Look for persisted users
    let users = [];
    try { users = JSON.parse(localStorage.getItem('users') || '[]'); } catch (err) { users = []; }

    const matched = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      if (matched.password === password) {
        // success
        const currentUser = { email: matched.email, firstName: matched.firstName || '', surname: matched.surname || '' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        show('Login successful! Redirecting...', false);
        setTimeout(() => { window.location.href = '/recipe/dashboard.html'; }, 700);
        return;
      } else {
        show('Incorrect password.');
        return;
      }
    }

    // If no registered user, accept login as demo fallback: create a session
    const fallbackName = email.split('@')[0] || 'User';
    const currentUser = { email, firstName: fallbackName, surname: '' };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    show('Logged in as demo user. Redirecting...', false);
    setTimeout(() => { window.location.href = '/recipe/dashboard.html'; }, 700);
  });
});
