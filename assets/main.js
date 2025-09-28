// assets/main.js
(function () {
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const root = document.documentElement;

  function prepareLines() {
    const nodes = [];
    const lead = infoPanel.querySelector('.lead');
    if (lead) nodes.push(lead);

    const roles = infoPanel.querySelectorAll('.roles span');
    roles.forEach((node) => nodes.push(node));

    const founders = infoPanel.querySelector('.founders');
    if (founders) nodes.push(founders);

    nodes.forEach((el, index) => {
      el.classList.add('line');
      el.style.setProperty('--delay', `${160 + index * 95}ms`);
    });
  }

  function openPanel() {
    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    root.classList.add('panel-open');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');

    setTimeout(() => {
      prepareLines();
      infoPanel.setAttribute('aria-hidden', 'false');
    }, 120);

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
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
    menuBtn.getAttribute('aria-expanded') === 'true' ? closePanel() : openPanel();
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
