/* ========================================
   Portfolio - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFilters();
  initScrollAnimations();
  initProjectCards();
  initHeaderScroll();
});

/* ----------------------------------------
   Smooth Navigation
   ---------------------------------------- */
function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ----------------------------------------
   Header: transparent → solid on scroll
   ---------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', throttle(onScroll, 50));
  onScroll();
}

/* ----------------------------------------
   Project Filter System
   ---------------------------------------- */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = `fadeUp 0.5s cubic-bezier(0.25,0.1,0.25,1) forwards ${index * 0.06}s`;
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ----------------------------------------
   Scroll-triggered Animations
   ---------------------------------------- */
function initScrollAnimations() {
  const els = document.querySelectorAll('.section-title, .filters');
  els.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}

/* ----------------------------------------
   Project Card Animations
   ---------------------------------------- */
function initProjectCards() {
  const cards = document.querySelectorAll('.project-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('animate-in'), index * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  cards.forEach(card => observer.observe(card));
}

/* ----------------------------------------
   Utility: Throttle
   ---------------------------------------- */
function throttle(fn, wait) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      fn(...args);
      last = now;
    }
  };
}
