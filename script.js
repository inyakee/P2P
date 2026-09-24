const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('is-open', !expanded);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 621px)').addEventListener('change', closeMenu);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let paused = reducedMotion.matches;
function setMotion(value) {
  paused = value;
  document.body.classList.toggle('motion-paused', paused);


  document.documentElement.style.scrollBehavior = paused ? 'auto' : '';
}

reducedMotion.addEventListener('change', event => setMotion(event.matches));
setMotion(paused);
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 }) : null;
if (revealObserver) document.querySelectorAll('.about-grid > *, .section-heading, .card, .church-grid > *').forEach(element => {
  element.classList.add('reveal');
  revealObserver.observe(element);
});
let framePending = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--progress', max > 0 ? Math.min(scrollY / max, 1) : 0);
  if (!paused) document.querySelector('.hero-art').style.setProperty('--parallax', `${Math.min(scrollY * 0.09, 45)}px`);
  framePending = false;
}
window.addEventListener('scroll', () => {
  if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
updateScroll();
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 9}deg`);
    card.style.setProperty('--rx', `${-((event.clientY - rect.top) / rect.height - 0.5) * 7}deg`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

// Scroll within the page without changing the visible URL.
function clearSectionFragment() {
  if (location.hash && ['http:', 'https:'].includes(location.protocol)) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }
}
clearSectionFragment();
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const section = document.getElementById(link.getAttribute('href').slice(1));
  if (!section) return;
  event.preventDefault();
  closeMenu();
  clearSectionFragment();
  if (!section.hasAttribute('tabindex')) {
    section.setAttribute('tabindex', '-1');
    section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
  }
  section.focus({ preventScroll: true });
  section.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
});
