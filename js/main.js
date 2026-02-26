/* ========================================
   Portfolio - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFilters();
  initScrollAnimations();
  initProjectCards();
  initActiveNavOnScroll();
});

/* ----------------------------------------
   Smooth Navigation
   ---------------------------------------- */
function initNavigation() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ----------------------------------------
   Active Nav Link on Scroll
   ---------------------------------------- */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;
    const headerHeight = document.querySelector('.header').offsetHeight;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', throttle(updateActiveNav, 100));
}

/* ----------------------------------------
   Project Filter System
   ---------------------------------------- */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      // Filter cards with animation
      cards.forEach((card, index) => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight; // trigger reflow
          card.style.animation = `fadeUp 0.4s ease forwards ${index * 0.08}s`;
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
  const animateElements = document.querySelectorAll(
    '.section-title, .about-description, .about-links, .field-item, .filters'
  );

  animateElements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  animateElements.forEach(el => observer.observe(el));
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
          setTimeout(() => {
            entry.target.classList.add('animate-in');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  cards.forEach(card => observer.observe(card));
}

/* ----------------------------------------
   Header Background on Scroll
   ---------------------------------------- */
window.addEventListener('scroll', throttle(() => {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.06)';
  } else {
    header.style.boxShadow = 'none';
  }
}, 50));

/* ----------------------------------------
   Utility: Throttle
   ---------------------------------------- */
function throttle(fn, wait) {
  let time = Date.now();
  return function (...args) {
    if ((time + wait - Date.now()) < 0) {
      fn(...args);
      time = Date.now();
    }
  };
}
