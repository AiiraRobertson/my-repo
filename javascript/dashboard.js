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
  const streamsEl = document.getElementById('streams');
  const recentUploads = document.getElementById('recentUploads');

  const logoutBtn = document.getElementById('logoutBtn');

  const name = (user.firstName || user.email.split('@')[0]).trim();
  fullnameEl.textContent = name.charAt(0).toUpperCase() + name.slice(1) + (user.surname ? (' ' + user.surname) : '');
  emailEl.textContent = user.email || '';
  welcomeEl.textContent = `Welcome back, ${name}!`;

  // avatar handling: show image if available, otherwise initials
  function setAvatarImage(src) {
    if (!src) {
      avatarEl.innerHTML = '';
      avatarEl.textContent = (name[0] || 'U').toUpperCase();
      return;
    }
    avatarEl.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Avatar';
    avatarEl.appendChild(img);
  }

  setAvatarImage(user.avatar);

  const avatarInput = document.getElementById('avatarInput');
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const removeAvatarBtn = document.getElementById('removeAvatarBtn');

  if (user.avatar) {
    removeAvatarBtn.style.display = 'inline-block';
  }

  changeAvatarBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      user.avatar = reader.result;
      localStorage.setItem('currentUser', JSON.stringify(user));
      setAvatarImage(user.avatar);
      removeAvatarBtn.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
  });

  removeAvatarBtn.addEventListener('click', () => {
    delete user.avatar;
    localStorage.setItem('currentUser', JSON.stringify(user));
    setAvatarImage(null);
    removeAvatarBtn.style.display = 'none';
  });

  // Email verification UI & actions
  emailEl.textContent = user.email || '';
  const emailStatusEl = document.getElementById('emailStatus');
  const sendVerificationBtn = document.getElementById('sendVerificationBtn');
  const markVerifiedBtn = document.getElementById('markVerifiedBtn');

  function updateEmailStatusUI() {
    if (!emailStatusEl || !sendVerificationBtn) return;
    if (user.verifiedEmail) {
      emailStatusEl.textContent = '(Verified)';
      emailStatusEl.style.color = 'green';
      sendVerificationBtn.style.display = 'none';
    } else {
      emailStatusEl.textContent = '(Unverified)';
      emailStatusEl.style.color = '';
      sendVerificationBtn.style.display = 'inline-block';
    }
  }

  updateEmailStatusUI();

  // Mark verified when arriving with query params from a verification link
  const params = new URLSearchParams(window.location.search);
  async function verifyTokenWithServer(token) {
    // try same-origin, then localhost:3000
    try {
      let res = await fetch('/api/verify-token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
      });
      if (!res.ok) {
        res = await fetch('http://localhost:3000/api/verify-token', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
        });
      }
      if (res && res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      // ignore
    }
    return null;
  }

  // check user status from server
  async function checkUserStatus(email) {
    try {
      let res = await fetch('/api/user-status?email=' + encodeURIComponent(email));
      if (!res.ok) {
        res = await fetch('http://localhost:3000/api/user-status?email=' + encodeURIComponent(email));
      }
      if (res && res.ok) return await res.json();
    } catch (err) {
      // ignore
    }
    return null;
  }

  // poll for verification (tries for up to timeoutMs)
  async function pollForVerification(email, { intervalMs = 3000, timeoutMs = 30000 } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const data = await checkUserStatus(email);
      if (data && data.ok && data.verified) return data;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return null;
  }

  (async () => {
    if (params.get('verified') === '1') {
      // If explicitly verified param present, accept it
      user.verifiedEmail = true;
      localStorage.setItem('currentUser', JSON.stringify(user));
      updateEmailStatusUI();
    } else if (params.get('token')) {
      // Validate token with server when possible
      const token = params.get('token');
      const data = await verifyTokenWithServer(token);
      if (data && data.ok && data.email && data.email === user.email) {
        user.verifiedEmail = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateEmailStatusUI();
      } else {
        // fallback: if token present but server unreachable, still mark if token param present (best-effort)
        user.verifiedEmail = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateEmailStatusUI();
      }
    }
  })();

  if (sendVerificationBtn) {
    sendVerificationBtn.addEventListener('click', async () => {
      sendVerificationBtn.disabled = true;
      const prevText = sendVerificationBtn.textContent;
      sendVerificationBtn.textContent = 'Sending...';
      try {
        // Try API on same origin first
        let res = await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        // If same-origin failed (no server), try local dev server
        if (!res.ok) {
          try {
            res = await fetch('http://localhost:3000/api/send-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email })
            });
          } catch (err2) {
            // swallow and fall through to fallback
          }
        }

        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.preview) {
            // Show preview link for dev/testing
            const open = confirm('Verification email sent via test SMTP. Open preview?');
            if (open) window.open(data.preview, '_blank');
          }

          // Start polling for server-side verification state (useful when user clicks the email)
          sendVerificationBtn.textContent = 'Sent — checking...';
          try {
            const verified = await pollForVerification(user.email);
            if (verified && verified.verified) {
              user.verifiedEmail = true;
              localStorage.setItem('currentUser', JSON.stringify(user));
              updateEmailStatusUI();
              alert('Email verified successfully.');
            }
          } catch (err) {
            // ignore polling errors
            console.error('Polling failed', err);
          }

          sendVerificationBtn.textContent = 'Sent';
          setTimeout(() => { sendVerificationBtn.textContent = 'Resend'; sendVerificationBtn.disabled = false; }, 1500);
          return;
        }

        // Fallback to mailto when server isn't available
        const verifyUrl = (location.origin || 'http://localhost:3000') + '/verify?token=demo&email=' + encodeURIComponent(user.email);
        window.location.href = 'mailto:' + encodeURIComponent(user.email) +
          '?subject=' + encodeURIComponent('Verify your DistroMusic account') +
          '&body=' + encodeURIComponent('Click the link to verify your account: ' + verifyUrl);
        sendVerificationBtn.textContent = 'Mail client opened';
        setTimeout(() => { sendVerificationBtn.textContent = 'Resend'; sendVerificationBtn.disabled = false; }, 1500);
      } catch (err) {
        console.error('Verification send failed', err);
        sendVerificationBtn.textContent = 'Error';
        setTimeout(() => { sendVerificationBtn.textContent = 'Resend'; sendVerificationBtn.disabled = false; }, 1500);
      }
    });
  }

  if (markVerifiedBtn) {
    markVerifiedBtn.style.display = 'inline-block';
    markVerifiedBtn.addEventListener('click', () => {
      user.verifiedEmail = true;
      localStorage.setItem('currentUser', JSON.stringify(user));
      updateEmailStatusUI();
    });
  }

  // Load mock stats from localStorage (or generate)
  const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
  const userStats = stats[user.email] || { uploads: 0, followers: 0, playlists: 0, streams: 0, recent: [] };

  // if uploads count not explicitly set, derive from recent entries
  const uploadsCount = userStats.uploads || (userStats.recent || []).length || 0;
  uploadsEl.textContent = uploadsCount;
  followersEl.textContent = userStats.followers || 0;
  playlistsEl.textContent = userStats.playlists || 0;

  const totalStreams = userStats.streams || (userStats.recent || []).reduce((s, r) => {
    if (typeof r === 'object' && r.streams) return s + (r.streams || 0);
    return s;
  }, 0);
  streamsEl.textContent = totalStreams || 0;

  if ((userStats.recent || []).length === 0) {
    recentUploads.textContent = 'No uploads yet.';
  } else {
    recentUploads.innerHTML = '';
    // render as table with details
    const table = document.createElement('table');
    table.className = 'uploads-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Title</th><th>Streams</th><th>Size</th><th>Uploaded</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    function formatSize(bytes) {
      if (!bytes && bytes !== 0) return '-';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;
      let n = Number(bytes);
      while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
      return n.toFixed(n < 10 && i > 0 ? 1 : 0) + ' ' + units[i];
    }

    userStats.recent.forEach(r => {
      const tr = document.createElement('tr');
      let title = '';
      let streams = '-';
      let size = '-';
      let uploaded = '-';
      if (typeof r === 'string') {
        title = r;
      } else {
        title = r.title || r.name || r.filename || 'Untitled';
        streams = (r.streams || 0);
        size = formatSize(r.size);
        uploaded = r.uploadedAt ? (new Date(r.uploadedAt)).toLocaleDateString() : '-';
      }
      const titleTd = document.createElement('td');
      if (r && r.url) {
        const a = document.createElement('a');
        a.href = r.url;
        a.textContent = title;
        a.target = '_blank';
        titleTd.appendChild(a);
      } else {
        titleTd.textContent = title;
      }
      const streamsTd = document.createElement('td'); streamsTd.textContent = streams;
      const sizeTd = document.createElement('td'); sizeTd.textContent = size;
      const uploadedTd = document.createElement('td'); uploadedTd.textContent = uploaded;
      tr.appendChild(titleTd);
      tr.appendChild(streamsTd);
      tr.appendChild(sizeTd);
      tr.appendChild(uploadedTd);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    recentUploads.appendChild(table);
    // show total uploaded files if uploads was derived from recent
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/recipe/login.html';
  });
});
