/* ========================================
   Main — Hero / About / Work interactions
   Mimics shuwithu.github.io behavior
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero');
  const about = document.getElementById('about');
  const work = document.getElementById('work');
  const triggerAbout = document.getElementById('triggerAbout');
  const triggerWork = document.getElementById('triggerWork');
  const closeAbout = document.getElementById('closeAbout');
  const closeWork = document.getElementById('closeWork');

  let isAnimating = false;

  // --- Open About (slides down from top) ---
  triggerAbout.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isAnimating = true;

    about.classList.remove('closing');
    about.classList.add('active');
    hero.classList.remove('push-down-return');
    hero.classList.add('push-down');

    setTimeout(() => { isAnimating = false; }, 550);
  });

  // --- Close About ---
  closeAbout.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isAnimating = true;

    about.classList.remove('active');
    about.classList.add('closing');
    hero.classList.remove('push-down');
    hero.classList.add('push-down-return');

    setTimeout(() => {
      about.classList.remove('closing');
      isAnimating = false;
    }, 550);
  });

  // --- Open Work (slides up from bottom) ---
  triggerWork.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isAnimating = true;

    work.classList.remove('closing');
    work.classList.add('active');
    hero.classList.remove('push-up-return');
    hero.classList.add('push-up');

    setTimeout(() => { isAnimating = false; }, 550);
  });

  // --- Close Work ---
  closeWork.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAnimating) return;
    isAnimating = true;

    work.classList.remove('active');
    work.classList.add('closing');
    hero.classList.remove('push-up');
    hero.classList.add('push-up-return');

    setTimeout(() => {
      work.classList.remove('closing');
      isAnimating = false;
    }, 550);
  });

  // --- Filter system ---
  const filterItems = document.querySelectorAll('.filters li');
  const projectItems = document.querySelectorAll('.project-item');

  filterItems.forEach(item => {
    item.addEventListener('click', () => {
      filterItems.forEach(f => f.classList.remove('is-checked'));
      item.classList.add('is-checked');

      const filter = item.getAttribute('data-filter');

      projectItems.forEach(p => {
        if (filter === 'all' || p.classList.contains(filter)) {
          p.classList.remove('hidden');
          p.classList.add('show');
        } else {
          p.classList.remove('show');
          p.classList.add('hidden');
        }
      });
    });
  });
});
