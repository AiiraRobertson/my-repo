document.addEventListener('DOMContentLoaded', () => {
  // Force phone display format for this page (mobile-first preview)
  try { document.body.classList.add('force-phone'); } catch (err) {}
  // CTA button: go to dashboard when logged in, otherwise to signup
  const cta = document.getElementById('ctaUpload');
  if (cta) {
    cta.addEventListener('click', (e) => {
      const current = localStorage.getItem('currentUser');
      if (current) {
        window.location.href = '/recipe/dashboard.html';
      } else {
        window.location.href = '/recipe/signup.html';
      }
    });
  }

  // Search/site search focuses the list filter if present
  const siteSearch = document.getElementById('site-search');
  const listFilter = document.getElementById('list-filter');
  if (siteSearch && listFilter) {
    siteSearch.addEventListener('input', () => {
      // copy the search to the list filter to unify filtering
      listFilter.value = siteSearch.value;
      listFilter.dispatchEvent(new Event('input'));
    });
  }

  // Filter latest music list
  const latestList = document.getElementById('latest-list');
  if (listFilter && latestList) {
    listFilter.addEventListener('input', () => {
      const q = listFilter.value.trim().toLowerCase();
      Array.from(latestList.children).forEach(li => {
        const txt = li.textContent.trim().toLowerCase();
        li.style.display = q === '' ? '' : (txt.includes(q) ? '' : 'none');
      });
    });
  }

  // Simple play button handlers for featured cards (demo)
  document.querySelectorAll('.card button[data-action="play"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const track = btn.getAttribute('data-track') || 'Track';
      // Simple demo: set localStorage lastPlayed and show a small toast
      try { localStorage.setItem('lastPlayed', track); } catch (err) {}
      const toast = document.createElement('div');
      toast.textContent = `Playing preview: ${track} (demo)`;
      toast.style.position = 'fixed';
      toast.style.right = '18px';
      toast.style.bottom = '18px';
      toast.style.background = 'rgba(0,0,0,0.8)';
      toast.style.color = '#fff';
      toast.style.padding = '10px 14px';
      toast.style.borderRadius = '8px';
      toast.style.zIndex = 9999;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    });
  });

  // Global search across featured cards and videos
  const searchInput = document.getElementById('site-search');
  const resultsSection = document.getElementById('search-results');
  const resultsList = document.getElementById('results-list');
  const queryLabel = document.getElementById('search-query');

  function clearResults() {
    resultsList.innerHTML = '';
    resultsSection.style.display = 'none';
  }

  function renderTrackResult(title, subtitle, imgSrc) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<img src="${imgSrc}" alt="cover" /><h4>${title}</h4><p class="muted">${subtitle}</p><div class="card-actions"><button class="button" data-action="play" data-track="${title}">Play</button></div>`;
    return card;
  }

  function renderVideoResult(title, iframeSrc) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-card';
    wrapper.setAttribute('data-title', title);
    wrapper.innerHTML = `<iframe src="${iframeSrc}" title="${title}" allowfullscreen></iframe><div class="muted" style="margin-top:8px">${title}</div>`;
    return wrapper;
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });

    searchInput.addEventListener('input', (e) => {
      const q = (e.target.value || '').trim().toLowerCase();
      if (!q) { clearResults(); return; }
      // Gather featured cards
      const featured = Array.from(document.querySelectorAll('.featured .card'));
      const videos = Array.from(document.querySelectorAll('.videos-grid .video-card'));

      const matches = [];
      featured.forEach(card => {
        const t = (card.querySelector('h4') && card.querySelector('h4').textContent) || '';
        const sub = (card.querySelector('.muted') && card.querySelector('.muted').textContent) || '';
        if (t.toLowerCase().includes(q) || sub.toLowerCase().includes(q)) {
          const img = card.querySelector('img') ? card.querySelector('img').getAttribute('src') : '/Picture/ant.jpeg';
          matches.push(renderTrackResult(t, sub, img));
        }
      });

      videos.forEach(v => {
        const title = (v.getAttribute('data-title') || '').toLowerCase();
        if (title.includes(q)) {
          const iframe = v.querySelector('iframe');
          const src = iframe ? iframe.getAttribute('src') : '';
          matches.push(renderVideoResult(v.getAttribute('data-title') || 'Video', src));
        }
      });

      resultsList.innerHTML = '';
      if (matches.length === 0) {
        resultsSection.style.display = 'block';
        queryLabel.textContent = e.target.value;
        resultsList.innerHTML = '<p class="muted">No results found.</p>';
        return;
      }

      matches.forEach(n => resultsList.appendChild(n));
      resultsSection.style.display = 'block';
      queryLabel.textContent = e.target.value;

      // Attach play handlers for results
      resultsList.querySelectorAll('button[data-action="play"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const track = btn.getAttribute('data-track');
          localStorage.setItem('lastPlayed', track);
          const toast = document.createElement('div');
          toast.textContent = `Playing preview: ${track} (demo)`;
          toast.style.position = 'fixed';
          toast.style.right = '18px';
          toast.style.bottom = '18px';
          toast.style.background = 'rgba(0,0,0,0.8)';
          toast.style.color = '#fff';
          toast.style.padding = '10px 14px';
          toast.style.borderRadius = '8px';
          toast.style.zIndex = 9999;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 1800);
        });
      });
    });
  }

});
