// Kesan antara muka SESIQ: ripple butang, spotlight kad, toast dan kiraan nombor
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ripple pada setiap butang
  document.addEventListener('pointerdown', (event) => {
    const button = event.target.closest('button, .upload-actions a');
    if (!button || button.disabled || reduceMotion) return;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  // Cahaya mengikut kursor pada kad
  document.addEventListener('pointermove', (event) => {
    const card = event.target.closest('.spotlight');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });

  let stack = null;
  const showToast = (message, type = 'success', life = 3500) => {
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.setProperty('--life', `${life}ms`);
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
    if (from === to) {
      el.textContent = to;
      return;
    }
    if (reduceMotion) {
      el.textContent = to;
      return;
    }
    const duration = 700;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
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
    }, 320);
  };

  window.SesiqUI = { showToast, animateCount, leaveTo };
})();
