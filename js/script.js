/* =================================================================
   PROTON EVENTWEEK - Main Script
   Vanilla JS, no heavy frameworks
   ================================================================= */

'use strict';

/* ─── 0. THEME (system default + user override) ─────────────── */
const THEME_KEY = 'eventweek-theme';
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  if (!themeToggle) return;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggle.setAttribute('aria-label', `Promeni temu na ${nextTheme === 'dark' ? 'tamnu' : 'svetlu'}`);
  themeToggle.setAttribute('title', `Promeni temu na ${nextTheme === 'dark' ? 'tamnu' : 'svetlu'}`);
}

function getSystemTheme() {
  return prefersDarkScheme.matches ? 'dark' : 'light';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const initialTheme = saved === 'dark' || saved === 'light' ? saved : getSystemTheme();
  setTheme(initialTheme);

  // Follow system changes only when the user has not manually selected a theme
  prefersDarkScheme.addEventListener('change', e => {
    if (localStorage.getItem(THEME_KEY)) return;
    setTheme(e.matches ? 'dark' : 'light');
  });

  themeToggle?.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') || getSystemTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

initTheme();

/* ─── 1. LOADING SCREEN ──────────────────────────────────────── */
window.addEventListener('load', () => {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  // Keep a minimum display time so the animation is visible
  setTimeout(() => screen.classList.add('hidden'), 900);
});

/* ─── 2. SCROLL PROGRESS BAR ─────────────────────────────────── */
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  if (!progressBar) return;
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = maxScroll > 0 ? `${(scrolled / maxScroll) * 100}%` : '0%';
}

/* ─── 3. NAVBAR SCROLL EFFECT ────────────────────────────────── */
const navbar  = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scroll-top');
const scrollIndicator = document.querySelector('.scroll-indicator');
let scrollHintDismissed = false;

function onScroll() {
  const y = window.scrollY;

  // Navbar blur
  if (navbar)  navbar.classList.toggle('scrolled', y > 20);

  // Scroll-to-top visibility
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 400);

  // Hide the scroll hint permanently after first meaningful scroll
  if (!scrollHintDismissed && y > 20) {
    scrollHintDismissed = true;
    scrollIndicator?.classList.add('hidden');
  }

  // Active nav link highlight
  updateActiveLink();

  // Progress bar
  updateProgress();

  // Parallax for hero shapes
  updateParallax(y);
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ─── 4. SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return; // ignore placeholder links
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = (navbar ? navbar.offsetHeight : 68) + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });

    // Close mobile menu if open
    closeMobileMenu();
  });
});

/* ─── 5. ACTIVE NAV LINK ─────────────────────────────────────── */
const sections  = document.querySelectorAll('section[id], footer[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  const offset = (navbar ? navbar.offsetHeight : 68) + 60;
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - offset) current = sec.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

/* ─── 6. HAMBURGER MENU ──────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar?.contains(e.target)) closeMobileMenu();
});

function closeMobileMenu() {
  mobileMenu?.classList.remove('open');
  hamburger?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('aria-hidden', 'true');
}

/* ─── 7. COUNTDOWN TIMER ─────────────────────────────────────── */
// Target: first day of EventWeek — change this date as needed
const EVENT_DATE = new Date('2026-03-23T18:00:00');

const cdDays    = document.getElementById('cd-days');
const cdHours   = document.getElementById('cd-hours');
const cdMinutes = document.getElementById('cd-minutes');
const cdSeconds = document.getElementById('cd-seconds');
const cdWrap    = document.getElementById('countdown-wrap');
const cdLabel   = cdWrap?.querySelector('.countdown-label');
const cdTimer   = document.getElementById('countdown');

function pad(n)   { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const diff = EVENT_DATE - Date.now();
  if (diff <= 0) {
    if (cdLabel) cdLabel.textContent = 'Proton EventWeek je počeo!';
    if (cdTimer) cdTimer.style.display = 'none';
    [cdDays, cdHours, cdMinutes, cdSeconds].forEach(el => { if (el) el.textContent = '00'; });
    clearInterval(cdInterval);
    return;
  }
  if (cdTimer) cdTimer.style.display = 'flex';
  const days    = Math.floor(diff / 86_400_000);
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000)  / 60_000);
  const seconds = Math.floor((diff % 60_000)     / 1_000);

  if (cdDays)    cdDays.textContent    = pad(days);
  if (cdHours)   cdHours.textContent   = pad(hours);
  if (cdMinutes) cdMinutes.textContent = pad(minutes);
  if (cdSeconds) cdSeconds.textContent = pad(seconds);
}

updateCountdown();
const cdInterval = setInterval(updateCountdown, 1_000);

/* ─── 8. PARALLAX — HERO SHAPES ─────────────────────────────── */
const shapes = document.querySelectorAll('.hero .shape');

function updateParallax(scrollY) {
  if (window.innerWidth < 768) return; // skip on mobile for perf
  shapes.forEach((shape, i) => {
    const speed = (i + 1) * 0.06;
    shape.style.transform = `translateY(${scrollY * speed}px)`;
  });
}

/* ─── 9. AOS — ANIMATE ON SCROLL ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing:   'ease-out-cubic',
      once:     true,
      offset:   80,
    });
  }
});

/* ─── 10. TOOLTIP (touch / click fallback) ───────────────────── */
// The CSS tooltip handles hover on desktop.
// For mobile we show a JS tooltip on touch.
const jsTooltip = document.getElementById('tooltip');

function showJsTooltip(el) {
  if (!jsTooltip || !el) return;
  const text = el.getAttribute('data-tooltip');
  if (!text) return;
  jsTooltip.textContent = text;
  jsTooltip.setAttribute('aria-hidden', 'false');
  jsTooltip.classList.add('show');

  const rect = el.getBoundingClientRect();
  const ttW  = 240;
  let left   = rect.left + rect.width / 2 - ttW / 2;
  let top    = rect.top  + window.scrollY - jsTooltip.offsetHeight - 14;

  // Keep tooltip within viewport
  left = Math.max(10, Math.min(left, window.innerWidth - ttW - 10));
  jsTooltip.style.left  = `${left}px`;
  jsTooltip.style.top   = `${top}px`;
  jsTooltip.style.width = `${ttW}px`;
}

function hideJsTooltip() {
  if (!jsTooltip) return;
  jsTooltip.classList.remove('show');
  jsTooltip.setAttribute('aria-hidden', 'true');
}

// Touch events for software buttons
document.querySelectorAll('.btn-software').forEach(btn => {
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    const isVisible = btn.classList.contains('tooltip-visible');
    document.querySelectorAll('.btn-software.tooltip-visible').forEach(b => b.classList.remove('tooltip-visible'));
    if (!isVisible) {
      btn.classList.add('tooltip-visible');
      showJsTooltip(btn);
    } else {
      hideJsTooltip();
    }
  }, { passive: false });
});

document.addEventListener('touchstart', e => {
  if (!e.target.closest('.btn-software')) {
    document.querySelectorAll('.btn-software.tooltip-visible').forEach(b => b.classList.remove('tooltip-visible'));
    hideJsTooltip();
  }
}, { passive: true });

/* ─── 10b. SOFTWARE DOWNLOAD MODAL ─────────────────────────── */
const softwareDownloads = {
  git: {
    name: 'Git',
    url: 'https://git-scm.com/'
  },
  githubdesktop: {
    name: 'GitHub Desktop',
    url: 'https://desktop.github.com/download/'
  },
  godot: {
    name: 'Godot Engine',
    url: 'https://godotengine.org/'
  },
  virtualbox: {
    name: 'Oracle VirtualBox',
    url: 'https://www.virtualbox.org/'
  },
  kalilinux: {
    name: 'Kali Linux',
    url: 'https://www.kali.org/'
  },
  go: {
    name: 'Go Programming Language',
    url: 'https://go.dev/'
  },
  hugo: {
    name: 'Hugo',
    url: 'https://gohugo.io/installation/'
  },
  python: {
    name: 'Python 3.10+',
    url: 'https://www.python.org/downloads/'
  },
  vscode: {
    name: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/download'
  }
};

const modal = document.getElementById('software-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

function openSoftwareModal(softwareIds) {
  if (!modal || !modalBody) return;
  
  const softwareList = softwareIds.split(',').map(id => id.trim());
  let html = '';
  
  softwareList.forEach(id => {
    const software = softwareDownloads[id];
    if (software) {
      html += `
        <div class="software-link-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
          <a href="${software.url}" target="_blank" rel="noopener noreferrer">
            ${software.name}
          </a>
        </div>
      `;
    }
  });
  
  if (html === '') {
    html = '<p style="color: var(--clr-text); opacity: 0.7;">Nema dostupnih softverskih paketa.</p>';
  }
  
  modalBody.innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeSoftwareModal() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

// Software button click handlers
document.querySelectorAll('.btn-software').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const software = btn.getAttribute('data-software');
    if (software) openSoftwareModal(software);
  });
});

// Modal close button
modalClose?.addEventListener('click', closeSoftwareModal);

// Close modal on backdrop click
modal?.addEventListener('click', e => {
  if (e.target === modal) closeSoftwareModal();
});

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal?.classList.contains('open')) {
    closeSoftwareModal();
  }
});

/* ─── 11. SCROLL-TO-TOP ──────────────────────────────────────── */
scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── 12. LAZY LOAD IMAGES (future-proof) ────────────────────── */
if ('IntersectionObserver' in window) {
  const lazyImgs = document.querySelectorAll('img[data-src]');
  const imgObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      obs.unobserve(img);
    });
  }, { rootMargin: '200px' });

  lazyImgs.forEach(img => imgObserver.observe(img));
}

/* ─── 13. KEYBOARD: close mobile menu on Escape ─────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    hideJsTooltip();
  }
});

/* ─── 14. INITIAL CALL ───────────────────────────────────────── */
onScroll();          // set correct state on page load
updateCountdown();   // ensure values shown before 1s
