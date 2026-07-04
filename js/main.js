/**
 * ============================================================
 * MAIN.JS — Shared behaviors used on every page
 * (navbar, mobile menu, dark mode, toasts, loading screen,
 * scroll reveal, animated counters, confetti burst).
 * Page-specific logic lives in dashboard.js / ranking.js / etc.
 * ============================================================
 */

/* ---------- Toast Notifications ---------- */
const Toast = (() => {
  let container;

  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
    error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>'
  };

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   */
  function show(message, type = 'info') {
    const root = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${ICONS[type] || ICONS.info}<span>${message}</span><button class="toast-close" aria-label="Dismiss">&times;</button>`;
    root.appendChild(toast);

    const remove = () => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    };
    toast.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, CONFIG.TOAST_DURATION_MS);
  }

  return {
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
    warning: (msg) => show(msg, 'warning')
  };
})();

/* ---------- Theme (Dark Mode) ---------- */
const ThemeManager = (() => {
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
  }

  function init() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved || (prefersDark ? 'dark' : 'light'));

    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        apply(current === 'dark' ? 'light' : 'dark');
      });
    });
  }

  return { init };
})();

/* ---------- Navbar (scroll shadow + mobile menu) ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
    }));
  }

  // Highlight the current page in the nav.
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    if (a.getAttribute('href') === current) a.classList.add('is-active');
  });
}

/* ---------- Loading Screen ---------- */
function hideLoadingScreen() {
  const screen = document.querySelector('.loading-screen');
  if (!screen) return;
  window.addEventListener('load', () => {
    setTimeout(() => screen.classList.add('is-hidden'), 400);
  });
  // Fallback in case 'load' already fired.
  if (document.readyState === 'complete') {
    setTimeout(() => screen.classList.add('is-hidden'), 400);
  }
}

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el) => observer.observe(el));
}

/* ---------- Animated Counters ---------- */
/**
 * Animate a numeric counter from 0 to data-target over CONFIG.COUNTER_ANIMATION_MS.
 * Triggers once the element enters the viewport.
 */
function initCounters(root = document) {
  const counters = root.querySelectorAll('.js-counter');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.target || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = CONFIG.COUNTER_ANIMATION_MS;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = target * eased;
      el.textContent = prefix + value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((el) => observer.observe(el));
}

/* ---------- Confetti Burst (used on Ranking page when leader changes) ---------- */
const Confetti = (() => {
  const COLORS = ['#12b76a', '#0ba5ec', '#ffb800', '#6ee7b7', '#7dd3fc'];

  function fire(durationMs = 2600) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speedY: 2 + Math.random() * 3,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: -8 + Math.random() * 16
    }));

    const start = performance.now();
    function loop(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (elapsed < durationMs) {
        requestAnimationFrame(loop);
      } else {
        window.removeEventListener('resize', resize);
        canvas.remove();
      }
    }
    requestAnimationFrame(loop);
  }

  return { fire };
})();

/* ---------- Chart.js Availability Guard ---------- */
/**
 * Chart.js loads from an external CDN. If the network blocks it (ad-blocker,
 * restrictive school/office network, offline), `Chart` will be undefined.
 * Pages that draw charts should check this before calling `new Chart(...)`
 * so a blocked CDN degrades gracefully instead of throwing and interrupting
 * the rest of the page's data rendering.
 */
function isChartJsReady() {
  return typeof Chart !== 'undefined';
}

/**
 * Replace a <canvas> element's container with a friendly "chart unavailable"
 * message. Used when Chart.js failed to load from the CDN.
 */
function renderChartUnavailable(canvasEl, message = 'ไม่สามารถโหลดกราฟได้ในขณะนี้ (ไลบรารีกราฟไม่พร้อมใช้งาน)') {
  if (!canvasEl || !canvasEl.parentElement) return;
  canvasEl.parentElement.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;padding:var(--space-3);">
      <p style="font-size:0.82rem;color:var(--text-muted);">📉 ${message}</p>
    </div>
  `;
}

/* ---------- Footer year ---------- */
function initFooterYear() {
  document.querySelectorAll('.js-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Global Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  initNavbar();
  hideLoadingScreen();
  initScrollReveal();
  initCounters();
  initFooterYear();
});
