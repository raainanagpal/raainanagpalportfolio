// ==========================================================================
// RAAINA NAGPAL — PORTFOLIO
// Shared behaviour: mobile nav, active-link highlighting, scroll reveal,
// and the "Now Playing" audio player.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Active nav link (works across all 4 pages) ---------- */
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  const openMenu = () => {
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-lock');
  };
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-lock');
  };

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- Audio player ---------- */
  const player = document.getElementById('audio-player');
  if (player) {
    const audio = player.querySelector('audio');
    const playBtn = player.querySelector('[data-audio-play]');
    const muteBtn = player.querySelector('[data-audio-mute]');
    const progress = player.querySelector('[data-audio-progress]');
    const songNameEl = player.querySelector('[data-audio-title]');

    const volumeIcon = muteBtn.querySelector('.icon-volume');
    const mutedIcon = muteBtn.querySelector('.icon-muted');

    let userHasTrack = true;

    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {
          if (songNameEl) songNameEl.textContent = 'Add your track — see README';
        });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => {
      player.classList.remove('paused');
    });

    audio.addEventListener('pause', () => {
      player.classList.add('paused');
    });

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
      }
    });

    progress.addEventListener('input', () => {
      if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
      }
    });

    muteBtn.addEventListener('click', () => {
      audio.muted = !audio.muted;
      volumeIcon.style.display = audio.muted ? 'none' : 'block';
      mutedIcon.style.display = audio.muted ? 'block' : 'none';
    });

    // If the placeholder/real file fails to load, fail gracefully.
    audio.addEventListener('error', () => {
      userHasTrack = false;
      if (songNameEl) songNameEl.textContent = 'Add your track — see README';
      playBtn.disabled = true;
      playBtn.style.opacity = '0.5';
    });

    player.classList.add('paused');

    /* ---------- Real audio-reactive equalizer (Web Audio API) ----------
       Drives the little bars in the "Now Playing" pill from the track's
       actual frequency data instead of a canned CSS animation. Falls back
       silently to the resting bars if the browser blocks it. */
    let audioCtx, analyser, freqData, rafId;
    const bars = player.querySelectorAll('.audio-eq span');

    function ensureAnalyser() {
      if (analyser) return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctx();
        const source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        freqData = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        analyser = null;
      }
    }

    function tickEQ() {
      if (!analyser) return;
      analyser.getByteFrequencyData(freqData);
      bars.forEach((bar, i) => {
        const sample = freqData[2 + i * 3] || 0;
        const height = 4 + (sample / 255) * 15;
        bar.style.height = height.toFixed(1) + 'px';
      });
      rafId = requestAnimationFrame(tickEQ);
    }

    audio.addEventListener('play', () => {
      ensureAnalyser();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      cancelAnimationFrame(rafId);
      tickEQ();
    });
    audio.addEventListener('pause', () => cancelAnimationFrame(rafId));
    audio.addEventListener('ended', () => cancelAnimationFrame(rafId));
  }

  /* ---------- Intro reveal (home page only, once per browser session) ---------- */
  const intro = document.getElementById('intro-overlay');
  if (intro) {
    const isHome = !document.body.dataset.page || document.body.dataset.page === 'home';
    if (!isHome || sessionStorage.getItem('rn_intro_shown')) {
      intro.remove();
    } else {
      sessionStorage.setItem('rn_intro_shown', '1');
      window.setTimeout(() => intro.classList.add('intro-hidden'), 1250);
      intro.addEventListener('transitionend', () => intro.remove());
      intro.addEventListener('click', () => intro.classList.add('intro-hidden'));
    }
  }

  /* ---------- Command palette (Ctrl/Cmd+K quick navigation) ---------- */
  const isSPA = window.__RN_SPA__ === true;

  function go(page, anchor) {
    if (isSPA) {
      const target = '#/' + page;
      if (window.location.hash.split('/')[1] === (page || undefined) || (window.location.hash === '' && page === '')) {
        if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.__RN_PENDING_ANCHOR__ = anchor || null;
        window.location.hash = target;
      }
    } else {
      const file = page ? page + '.html' : 'index.html';
      const current = window.location.pathname.split('/').pop() || 'index.html';
      if (file === current && anchor) {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = file + (anchor ? '#' + anchor : '');
      }
    }
  }

  const COMMANDS = [
    { label: 'Go to About', hint: 'Home', page: '' },
    { label: 'Go to Projects', hint: '', page: 'projects' },
    { label: 'Go to Experience', hint: '', page: 'experience' },
    { label: 'Go to Resume', hint: '', page: 'resume' },
    { label: 'Unwind (after 9)', hint: 'Project', page: 'projects', anchor: 'project-unwind' },
    { label: 'Influencer Payment OS', hint: 'Project', page: 'projects', anchor: 'project-invoice-os' },
    { label: 'AI Speaker Bot — Pooja', hint: 'Project', page: 'projects', anchor: 'project-speaker-bot' },
    { label: 'CarePulse', hint: 'Project', page: 'projects', anchor: 'project-carepulse' },
    { label: 'Drums Are Calling', hint: 'Song', page: 'projects', anchor: 'project-song' },
    { label: 'Say "I Do" to Paying Double', hint: 'Article', page: 'projects', anchor: 'project-article' },
    { label: 'Sector Map: Social & Live Commerce', hint: 'Deck', page: 'projects', anchor: 'project-sector-map' },
    { label: 'Download Resume', hint: '↓', action: () => {
        const a = document.createElement('a');
        a.href = 'assets/resume/Raaina_Nagpal_Resume.pdf';
        a.download = 'Raaina_Nagpal_Resume.pdf';
        a.click();
      } },
    { label: 'Email Raaina', hint: 'raainanagpal@gmail.com', action: () => { window.location.href = 'mailto:raainanagpal@gmail.com'; } },
    { label: 'View LinkedIn', hint: '↗', action: () => window.open('https://www.linkedin.com/in/raaina-nagpal-682293224', '_blank', 'noopener') },
    { label: 'View Instagram', hint: '↗', action: () => window.open('https://www.instagram.com/raaina1510', '_blank', 'noopener') },
    { label: 'Play / Pause Music', hint: 'Space', action: () => document.querySelector('[data-audio-play]')?.click() },
  ];

  const ICON_SVG = {
    nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    project: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16"/></svg>',
    action: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>',
  };

  function buildPalette() {
    const backdrop = document.createElement('div');
    backdrop.className = 'cmdk-backdrop';
    backdrop.innerHTML = `
      <div class="cmdk-modal" role="dialog" aria-label="Quick navigation">
        <div class="cmdk-input-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="cmdk-input" type="text" placeholder="Jump to a page, project, or link…" aria-label="Search" />
        </div>
        <div class="cmdk-list"></div>
        <div class="cmdk-footer">
          <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>
          <span><kbd>&crarr;</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>`;
    document.body.appendChild(backdrop);

    const input = backdrop.querySelector('.cmdk-input');
    const list = backdrop.querySelector('.cmdk-list');
    let filtered = COMMANDS.slice();
    let activeIndex = 0;

    function iconFor(cmd) {
      if (cmd.action) return ICON_SVG.action;
      if (cmd.anchor) return ICON_SVG.project;
      return ICON_SVG.nav;
    }

    function updateActiveClasses() {
      Array.from(list.children).forEach((row, i) => {
        row.classList.toggle('active', i === activeIndex);
      });
    }

    function render() {
      list.innerHTML = '';
      if (!filtered.length) {
        list.innerHTML = '<div class="cmdk-empty">No matches</div>';
        return;
      }
      filtered.forEach((cmd, i) => {
        const row = document.createElement('div');
        row.className = 'cmdk-item' + (i === activeIndex ? ' active' : '');
        row.innerHTML = `${iconFor(cmd)}<span style="flex:1">${cmd.label}</span><span style="font-size:0.72rem;color:var(--outline)">${cmd.hint || ''}</span>`;
        // Only re-highlight on hover — never rebuild the list here, or a click
        // landing right as the row is destroyed/recreated would hit nothing.
        row.addEventListener('mouseenter', () => { activeIndex = i; updateActiveClasses(); });
        row.addEventListener('click', () => select(cmd));
        list.appendChild(row);
      });
    }

    function select(cmd) {
      close();
      if (cmd.action) cmd.action();
      else go(cmd.page, cmd.anchor);
    }

    function filterCommands() {
      const q = input.value.trim().toLowerCase();
      filtered = !q ? COMMANDS.slice() : COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || (c.hint || '').toLowerCase().includes(q));
      activeIndex = 0;
      render();
    }

    function open() {
      backdrop.classList.add('open');
      input.value = '';
      filterCommands();
      window.setTimeout(() => input.focus(), 30);
      document.body.classList.add('menu-lock');
    }
    function close() {
      backdrop.classList.remove('open');
      document.body.classList.remove('menu-lock');
    }

    input.addEventListener('input', filterCommands);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    backdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); updateActiveClasses(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); updateActiveClasses(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIndex]) select(filtered[activeIndex]); }
    });

    return { open, close, isOpen: () => backdrop.classList.contains('open') };
  }

  const palette = buildPalette();

  document.addEventListener('keydown', (e) => {
    const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    if (isCmdK) {
      e.preventDefault();
      palette.isOpen() ? palette.close() : palette.open();
    }
  });

  const hint = document.getElementById('cmdk-hint');
  if (hint) hint.addEventListener('click', () => palette.open());

  /* ---------- Interactive pipeline simulator (Influencer Payment OS) ---------- */
  document.querySelectorAll('.pipeline').forEach((pipeline) => {
    const nodes = Array.from(pipeline.querySelectorAll('.pipeline-node'));
    const connectors = Array.from(pipeline.querySelectorAll('.pipeline-connector'));
    const numEl = pipeline.querySelector('.pd-num');
    const titleEl = pipeline.querySelector('.pd-title');
    const textEl = pipeline.querySelector('.pd-text');
    const playBtn = pipeline.querySelector('[data-pipeline-play]');
    const playLabel = playBtn ? playBtn.querySelector('span') : null;
    let timer = null;

    function stopSim() {
      clearInterval(timer);
      timer = null;
      if (playLabel) playLabel.textContent = 'Run simulation';
    }

    function setActive(i) {
      nodes.forEach((n, idx) => {
        n.classList.toggle('active', idx === i);
        n.classList.toggle('done', idx < i);
      });
      connectors.forEach((c, idx) => c.classList.toggle('done', idx < i));
      const d = nodes[i].dataset;
      numEl.textContent = 'Step ' + d.num;
      titleEl.textContent = d.title;
      textEl.textContent = d.desc;
    }

    nodes.forEach((n, i) => {
      n.addEventListener('click', () => {
        stopSim();
        setActive(i);
      });
    });

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (timer) { stopSim(); return; }
        playLabel.textContent = 'Pause simulation';
        let i = 0;
        setActive(0);
        timer = setInterval(() => {
          i += 1;
          if (i >= nodes.length) { stopSim(); return; }
          setActive(i);
        }, 1300);
      });
    }

    setActive(0);
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
