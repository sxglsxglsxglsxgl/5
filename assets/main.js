// assets/main.js
(function () {
  const menuBtn = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const root = document.documentElement;

  function openPanel() {
    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    root.classList.add('panel-open');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');

    root.style.setProperty('--panel-delay', '.12s');

    infoPanel.setAttribute('aria-hidden', 'false');

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    root.style.setProperty('--panel-delay', '0s');

    infoPanel.setAttribute('aria-hidden', 'true');
    root.classList.remove('panel-open');

    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    setTimeout(() => {
      if (window.__unfreezeSafeAreas) window.__unfreezeSafeAreas();
    }, 300);
  }

  function togglePanel() {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  }

  menuBtn.addEventListener('click', togglePanel);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
  });

  infoPanel.addEventListener('click', (event) => {
    const content = event.currentTarget.querySelector('.info-content');
    if (event.target === event.currentTarget || !content.contains(event.target)) {
      closePanel();
    }
  });

  infoPanel.setAttribute('aria-hidden', 'true');
})();
