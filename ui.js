// Kesan antara muka SESIQ: toast, kiraan nombor dan peralihan halaman
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stack = null;
  const showToast = (message, type = 'success', life = 3000) => {
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    stack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, life);
  };

  const animateCount = (el, to) => {
    if (!el) return;
    const from = Number(el.dataset.value ?? el.textContent) || 0;
    el.dataset.value = to;
    if (from === to || reduceMotion) {
      el.textContent = to;
      return;
    }
    const duration = 600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Pudar keluar sebelum tukar halaman
  const leaveTo = (url) => {
    if (reduceMotion) {
      window.location.href = url;
      return;
    }
    document.body.classList.add('leaving');
    setTimeout(() => {
      window.location.href = url;
    }, 250);
  };

  // Tema cerah/gelap: pilihan pengguna disimpan; jika tiada, ikut sistem
  const THEME_KEY = 'sesiq-theme';
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const readSaved = () => {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  };
  const applyTheme = (theme, animate = false) => {
    if (animate && !reduceMotion) {
      root.classList.add('theme-anim');
      setTimeout(() => root.classList.remove('theme-anim'), 400);
    }
    root.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', theme === 'dark' ? '#0e0f11' : '#f7f7f5');
      meta.removeAttribute('media');
    });
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      const label = theme === 'dark' ? 'Tukar ke mod cerah' : 'Tukar ke mod gelap';
      btn.setAttribute('aria-label', label);
      btn.title = label;
    });
  };
  const toggleTheme = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      // Tetap tukar walaupun storan tidak tersedia
    }
    applyTheme(next, true);
  };

  applyTheme(readSaved() || (systemDark.matches ? 'dark' : 'light'));
  systemDark.addEventListener('change', (event) => {
    if (!readSaved()) applyTheme(event.matches ? 'dark' : 'light', true);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-theme-toggle]')) toggleTheme();
  });

  window.SesiqUI = { showToast, animateCount, leaveTo, toggleTheme };
})();
