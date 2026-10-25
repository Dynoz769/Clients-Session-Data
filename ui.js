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

  window.SesiqUI = { showToast, animateCount, leaveTo };
})();
