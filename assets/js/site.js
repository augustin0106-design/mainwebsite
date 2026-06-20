/* ============================================================
   駿佾老師的 Gogoland — Interactive Logic
   ============================================================ */
(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. Data Loading
  // ------------------------------------------------------------
  function loadData() {
    // Prefer global from data/simulations.js if it exists,
    // otherwise fall back to inline JSON.
    if (typeof window.GogolandData === 'object' && window.GogolandData) {
      return window.GogolandData;
    }
    if (typeof window.GOGOLAND_DATA === 'object' && window.GOGOLAND_DATA) {
      return window.GOGOLAND_DATA;
    }
    const node = document.getElementById('gogoland-data');
    if (!node) return null;
    try { return JSON.parse(node.textContent); }
    catch (err) { console.error('[Gogoland] data parse error:', err); return null; }
  }

  const DATA = loadData();
  if (!DATA) return;

  // ------------------------------------------------------------
  // 2. DOM References
  // ------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    appShell:        $('.app-shell'),
    sidebarToggle:   $('#sidebar-toggle'),
    sidebar:         $('#sidebar'),
    sidebarScrim:    $('#sidebar-scrim'),
    homeButton:      $('#home-button'),
    searchInput:     $('#search-input'),
    categoryList:    $('#category-list'),
    welcomePanel:    $('#welcome-panel'),
    playerPanel:     $('#player-panel'),
    categoryOrbits:  $('#category-orbits'),
    quickStats:      $('#quick-stats'),
    featuredList:    $('#featured-list'),
    featuredCount:   $('#featured-count'),
    currentCategory: $('#current-category'),
    currentTitle:    $('#current-title'),
    reloadButton:    $('#reload-button'),
    openNewButton:   $('#open-new-button'),
    backButton:      $('#back-button'),
    frameLoading:    $('#frame-loading'),
    simulationFrame: $('#simulation-frame'),
    reportLink:      $('#report-link'),
    ctaExplore:      $('#cta-explore'),
    ctaScroll:       $('#cta-scroll'),
    workspace:       $('#workspace')
  };

  // Build quick maps
  const categoriesById = Object.fromEntries(DATA.categories.map(c => [c.id, c]));
  const simulationsById = Object.fromEntries(DATA.simulations.map(s => [s.id, s]));

  // ------------------------------------------------------------
  // 3. Utility: Lucide refresh
  // ------------------------------------------------------------
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { window.lucide.createIcons(); } catch (e) { /* ignore */ }
    }
  }

  function trackEvent(name, params = {}) {
    if (typeof window.gtag !== 'function') return;
    try { window.gtag('event', name, params); }
    catch (e) { /* Analytics should never block the portal UI. */ }
  }

  // ------------------------------------------------------------
  // 4. Utility: Color helpers
  // ------------------------------------------------------------
  // Category gradient endpoints (matches CSS tokens)
  const CAT_PALETTE = {
    physics:  { from: '#2563eb', to: '#06b6d4' },
    chemistry:{ from: '#0f9f8e', to: '#8dbb2f' },
    learning: { from: '#16a34a', to: '#84cc16' },
    emotion:  { from: '#ef476f', to: '#c084fc' },
    other:    { from: '#f59e0b', to: '#fb7185' }
  };

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function catStyle(catId) {
    const cat = categoriesById[catId];
    const pal = CAT_PALETTE[catId] || { from: cat?.color || '#3b6dff', to: '#7b5cff' };
    return [
      `--cat-color: ${cat?.color || pal.from}`,
      `--cat-color-soft: ${hexToRgba(pal.from, 0.18)}`,
      `--cat-bg: ${hexToRgba(pal.from, 0.10)}`,
      `--cat-glow: ${hexToRgba(pal.from, 0.35)}`,
      `--cat-grad: linear-gradient(135deg, ${pal.from} 0%, ${pal.to} 100%)`
    ].join('; ');
  }

  // ------------------------------------------------------------
  // 5. Render: Sidebar (category list)
  // ------------------------------------------------------------
  function renderSidebar(filterText = '') {
    const q = filterText.trim().toLowerCase();
    let totalMatched = 0;
    const groupsHtml = DATA.categories.map(cat => {
      const sims = DATA.simulations.filter(s => s.category === cat.id);
      const matched = sims.filter(s => {
        if (!q) return true;
        return (
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.tags || []).some(t => t.toLowerCase().includes(q)) ||
          cat.name.toLowerCase().includes(q)
        );
      });
      if (!matched.length) return '';
      totalMatched += matched.length;
      const items = matched.map(sim => {
        return `
          <button class="sim-item" data-sim-id="${sim.id}" type="button" style="${catStyle(cat.id)}">
            <span class="sim-item-icon"><i data-lucide="${sim.icon || 'circle'}"></i></span>
            <span class="sim-item-title">${escapeHtml(sim.title)}</span>
          </button>
        `;
      }).join('');
      return `
        <div class="category-group" style="--cat-color: ${cat.color}">
          <div class="category-head">
            <span class="category-head-dot"></span>
            <span class="category-head-name">${escapeHtml(cat.name)}</span>
            <span class="category-head-count">${matched.length}</span>
          </div>
          ${items}
        </div>
      `;
    }).join('');

    if (!totalMatched) {
      els.categoryList.innerHTML = `
        <div class="empty-state">
          <p>找不到符合「${escapeHtml(filterText)}」的模擬</p>
        </div>
      `;
    } else {
      els.categoryList.innerHTML = groupsHtml;
    }
    refreshIcons();
    markActiveSim();
  }

  function markActiveSim() {
    const activeId = state.currentSimId;
    $$('.sim-item').forEach(el => {
      el.classList.toggle('is-active', el.dataset.simId === activeId);
    });
  }

  // ------------------------------------------------------------
  // 6. Render: Quick Stats
  // ------------------------------------------------------------
  function renderStats() {
    const total = DATA.simulations.length;
    const totalCats = DATA.categories.length;
    const totalTags = new Set(DATA.simulations.flatMap(s => s.tags || [])).size;
    const stats = [
      {
        label: 'COLLECTION', value: total, suffix: '件',
        icon: 'layout-grid',
        color: '#2563eb', accent: 'linear-gradient(90deg, #2563eb, #06b6d4)'
      },
      {
        label: 'CURATION', value: totalCats, suffix: '類',
        icon: 'shapes',
        color: '#0f9f8e', accent: 'linear-gradient(90deg, #0f9f8e, #8dbb2f)'
      },
      {
        label: 'KEYWORDS', value: totalTags, suffix: '+',
        icon: 'tag',
        color: '#334155', accent: 'linear-gradient(90deg, #334155, #64748b)'
      },
      {
        label: 'STATUS', value: 'Open', suffix: '',
        icon: 'zap',
        color: '#2563eb', accent: 'linear-gradient(90deg, #2563eb, #0ea5e9)'
      }
    ];
    els.quickStats.innerHTML = stats.map(s => `
      <div class="stat-card"
           style="--stat-color: ${s.color}; --stat-bg: ${hexToRgba(s.color, 0.10)}; --stat-accent: ${s.accent}">
        <div class="stat-icon"><i data-lucide="${s.icon}"></i></div>
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}<span class="stat-suffix">${s.suffix}</span></div>
      </div>
    `).join('');
    refreshIcons();
  }

  function renderCategoryOrbits() {
    if (!els.categoryOrbits) return;
    els.categoryOrbits.innerHTML = DATA.categories.map((cat, index) => {
      const count = DATA.simulations.filter(s => s.category === cat.id).length;
      const sample = DATA.simulations
        .filter(s => s.category === cat.id)
        .slice(0, 3)
        .map(s => `<span>${escapeHtml(s.title)}</span>`)
        .join('');
      return `
        <button class="category-orbit category-orbit--${index + 1}" data-category-id="${cat.id}" type="button" style="${catStyle(cat.id)}">
          <span class="category-orbit-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="category-orbit-icon"><i data-lucide="${cat.icon || 'circle'}"></i></span>
          <span class="category-orbit-name">${escapeHtml(cat.name)}</span>
          <span class="category-orbit-count">${count} 件作品</span>
          <span class="category-orbit-samples">${sample}</span>
        </button>
      `;
    }).join('');
    refreshIcons();
  }

  // ------------------------------------------------------------
  // 7. Render: Featured Cards
  // ------------------------------------------------------------
  function pickFeatured() {
    // Pick 1-2 from each category to ensure variety
    const featured = [];
    const grouped = {};
    DATA.simulations.forEach(s => {
      grouped[s.category] = grouped[s.category] || [];
      grouped[s.category].push(s);
    });
    // Round-robin pick
    let added = true;
    while (added && featured.length < 6) {
      added = false;
      for (const cat of DATA.categories) {
        if (!grouped[cat.id] || !grouped[cat.id].length) continue;
        if (featured.length >= 6) break;
        featured.push(grouped[cat.id].shift());
        added = true;
      }
    }
    return featured;
  }

  function renderFeatured() {
    const featured = pickFeatured();
    els.featuredCount.textContent = `${featured.length} / ${DATA.simulations.length}`;
    els.featuredList.innerHTML = featured.map(sim => {
      const cat = categoriesById[sim.category];
      const tags = (sim.tags || []).slice(0, 3).map(t =>
        `<span class="sim-card-tag">#${escapeHtml(t)}</span>`
      ).join('');
      return `
        <button class="sim-card" data-sim-id="${sim.id}" type="button" style="${catStyle(sim.category)}">
          <div class="sim-card-header">
            <div class="sim-card-icon"><i data-lucide="${sim.icon || 'circle'}"></i></div>
            <span class="sim-card-cat">
              <span class="dot"></span>
              ${escapeHtml(cat?.name || '')}
            </span>
          </div>
          <h3 class="sim-card-title">${escapeHtml(sim.title)}</h3>
          <p class="sim-card-desc">${escapeHtml(sim.description)}</p>
          <div class="sim-card-tags">${tags}</div>
          <span class="sim-card-arrow"><i data-lucide="arrow-up-right"></i></span>
        </button>
      `;
    }).join('');
    refreshIcons();
  }

  // ------------------------------------------------------------
  // 8. State
  // ------------------------------------------------------------
  const state = {
    currentSimId: null
  };

  // ------------------------------------------------------------
  // 9. Sidebar Toggle
  // ------------------------------------------------------------
  function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }

  function setSidebarOpen(open) {
    els.appShell.dataset.sidebarOpen = open ? 'true' : 'false';
    els.sidebarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (isMobile()) {
      els.sidebar.style.transform = open ? 'translateX(0)' : 'translateX(-110%)';
      els.sidebar.style.opacity = open ? '1' : '0';
      els.sidebar.style.pointerEvents = open ? 'auto' : 'none';
      els.sidebar.style.visibility = open ? 'visible' : 'hidden';
      els.sidebarScrim.style.opacity = open ? '1' : '0';
      els.sidebarScrim.style.pointerEvents = open ? 'auto' : 'none';
    } else {
      els.sidebar.style.transform = '';
      els.sidebar.style.opacity = '';
      els.sidebar.style.pointerEvents = '';
      els.sidebar.style.visibility = '';
      els.sidebarScrim.style.opacity = '';
      els.sidebarScrim.style.pointerEvents = '';
    }
  }

  els.sidebarToggle.addEventListener('click', () => {
    const open = els.appShell.dataset.sidebarOpen !== 'true';
    setSidebarOpen(open);
  });

  els.sidebarScrim.addEventListener('click', () => setSidebarOpen(false));

  // Auto-close sidebar on mobile when selecting a simulation
  function maybeCloseSidebarMobile() {
    if (isMobile()) setSidebarOpen(false);
  }

  // ------------------------------------------------------------
  // 10. Panel Switching
  // ------------------------------------------------------------
  function showWelcome() {
    state.currentSimId = null;
    els.welcomePanel.hidden = false;
    els.playerPanel.hidden = true;
    els.simulationFrame.src = 'about:blank';
    markActiveSim();
    // Clear URL hash
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (els.workspace) els.workspace.scrollTop = 0;
  }

  function showPlayer(sim) {
    state.currentSimId = sim.id;
    const cat = categoriesById[sim.category];
    els.welcomePanel.hidden = true;
    els.playerPanel.hidden = false;
    els.currentCategory.textContent = cat?.name || '';
    els.currentTitle.textContent = sim.title;
    document.title = `${sim.title} · ${DATA.site.name}`;
    els.openNewButton.href = sim.url;
    showLoading();
    els.simulationFrame.src = sim.url;
    // Update hash for deep linking
    if (location.hash !== `#${sim.id}`) {
      history.replaceState(null, '', `#${sim.id}`);
    }
    markActiveSim();
    if (els.workspace) els.workspace.scrollTop = 0;
    trackEvent('simulation_open', {
      simulation_id: sim.id,
      simulation_title: sim.title,
      category: cat?.name || '',
      category_id: sim.category
    });
  }

  function showLoading() {
    els.frameLoading.classList.remove('is-hidden');
  }
  function hideLoading() {
    els.frameLoading.classList.add('is-hidden');
  }

  els.simulationFrame.addEventListener('load', () => {
    // Don't hide loading for blank pages
    try {
      if (els.simulationFrame.src && els.simulationFrame.src !== 'about:blank') {
        hideLoading();
      }
    } catch (e) { hideLoading(); }
  });

  // ------------------------------------------------------------
  // 11. Event Delegation: Simulation Clicks
  // ------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-sim-id]');
    if (!card) return;
    const sim = simulationsById[card.dataset.simId];
    if (!sim) return;
    e.preventDefault();
    showPlayer(sim);
    maybeCloseSidebarMobile();
  });

  document.addEventListener('click', (e) => {
    const categoryPortal = e.target.closest('[data-category-id]');
    if (!categoryPortal) return;
    const cat = categoriesById[categoryPortal.dataset.categoryId];
    if (!cat || !els.searchInput) return;
    e.preventDefault();
    els.searchInput.value = cat.name;
    renderSidebar(cat.name);
    setSidebarOpen(true);
    els.searchInput.focus();
  });

  // ------------------------------------------------------------
  // 12. Top-level buttons
  // ------------------------------------------------------------
  els.homeButton.addEventListener('click', () => {
    showWelcome();
    document.title = DATA.site.name;
  });

  if (els.backButton) {
    els.backButton.addEventListener('click', () => {
      showWelcome();
      document.title = DATA.site.name;
    });
  }

  els.reloadButton.addEventListener('click', () => {
    if (!state.currentSimId) return;
    const sim = simulationsById[state.currentSimId];
    if (!sim) return;
    els.reloadButton.classList.add('is-spinning');
    setTimeout(() => els.reloadButton.classList.remove('is-spinning'), 700);
    showLoading();
    // Reload via re-assigning src
    els.simulationFrame.src = sim.url + (sim.url.includes('?') ? '&' : '?') + 't=' + Date.now();
  });

  // ------------------------------------------------------------
  // 13. Search
  // ------------------------------------------------------------
  let searchTimer = null;
  els.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchTimer = setTimeout(() => {
      renderSidebar(v);
      const term = v.trim();
      if (term.length >= 2) {
        trackEvent('search', { search_term: term });
      }
    }, 120);
  });

  // Keyboard shortcut: Cmd/Ctrl + K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isMobile()) setSidebarOpen(true);
      els.searchInput.focus();
      els.searchInput.select();
    }
    if (e.key === 'Escape' && !els.playerPanel.hidden && document.activeElement !== els.searchInput) {
      // Optional: ESC to return home (uncomment if desired)
      // showWelcome();
    }
  });

  // ------------------------------------------------------------
  // 14. CTA buttons
  // ------------------------------------------------------------
  if (els.ctaExplore) {
    els.ctaExplore.addEventListener('click', () => {
      if (isMobile()) setSidebarOpen(true);
      els.searchInput.focus();
    });
  }
  if (els.ctaScroll) {
    els.ctaScroll.addEventListener('click', () => {
      els.featuredList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ------------------------------------------------------------
  // 15. Report link
  // ------------------------------------------------------------
  if (els.reportLink && DATA.site.reportEmail) {
    const subject = encodeURIComponent(`[Gogoland 問題回報]`);
    els.reportLink.href = `mailto:${DATA.site.reportEmail}?subject=${subject}`;
  }

  // ------------------------------------------------------------
  // 16. Hash routing (deep linking)
  // ------------------------------------------------------------
  function handleHash() {
    const hash = location.hash.replace('#', '').trim();
    if (!hash) return;
    const sim = simulationsById[hash];
    if (sim) {
      showPlayer(sim);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ------------------------------------------------------------
  // 17. Responsive: close sidebar by default on mobile
  // ------------------------------------------------------------
  function applyInitialSidebar() {
    if (isMobile()) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }
  applyInitialSidebar();

  // Re-check on resize (debounced)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Only auto-adjust if user hasn't deliberately toggled in this state
      // Simple approach: re-apply on breakpoint cross
      if (isMobile() && els.appShell.dataset.sidebarOpen === 'true') {
        // keep, user choice
      }
    }, 150);
  });

  // ------------------------------------------------------------
  // 18. Utility: escape HTML
  // ------------------------------------------------------------
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ------------------------------------------------------------
  // 19. Boot
  // ------------------------------------------------------------
  function boot() {
    renderSidebar();
    renderCategoryOrbits();
    renderStats();
    renderFeatured();
    refreshIcons();
    // Process hash if present
    if (location.hash) {
      // small timeout to let renders settle
      setTimeout(handleHash, 60);
    }
  }

  // Lucide may not be loaded yet (it's deferred); wait a tick
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Retry icon refresh after Lucide finishes loading
  window.addEventListener('load', () => {
    setTimeout(refreshIcons, 50);
  });
})();
