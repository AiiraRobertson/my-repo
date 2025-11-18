document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('currentUser');
  if (!raw) {
    // Not logged in -> send to login
    window.location.href = '/recipe/login.html';
    return;
  }
  const user = JSON.parse(raw);

  const fullnameEl = document.getElementById('fullname');
  const emailEl = document.getElementById('email');
  const avatarEl = document.getElementById('avatar');
  const welcomeEl = document.getElementById('welcome');

  const uploadsEl = document.getElementById('uploads');
  const followersEl = document.getElementById('followers');
  const playlistsEl = document.getElementById('playlists');
  const recentUploads = document.getElementById('recentUploads');

  const logoutBtn = document.getElementById('logoutBtn');

  const name = (user.firstName || user.email.split('@')[0]).trim();
  fullnameEl.textContent = name.charAt(0).toUpperCase() + name.slice(1) + (user.surname ? (' ' + user.surname) : '');
  emailEl.textContent = user.email || '';
  avatarEl.textContent = (name[0] || 'U').toUpperCase();
  welcomeEl.textContent = `Welcome back, ${name}!`;

  // Load mock stats from localStorage (or generate)
  const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
  const userStats = stats[user.email] || { uploads: 0, followers: 0, playlists: 0, recent: [] };

  uploadsEl.textContent = userStats.uploads || 0;
  followersEl.textContent = userStats.followers || 0;
  playlistsEl.textContent = userStats.playlists || 0;

  if ((userStats.recent || []).length === 0) {
    recentUploads.textContent = 'No uploads yet.';
  } else {
    recentUploads.innerHTML = '';
    const ul = document.createElement('ul');
    userStats.recent.forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      ul.appendChild(li);
    });
    recentUploads.appendChild(ul);
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/recipe/login.html';
  });
});
