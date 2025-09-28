// assets/main.js
(function () {
  const root      = document.documentElement;
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const infoFit   = (infoPanel && infoPanel.querySelector('.info-fit')) || infoPanel;
  const infoCont  = infoPanel ? infoPanel.querySelector('.info-content') : null;

  if (!menuBtn || !infoPanel || !infoCont || !infoFit) {
    return;
  }

  const OPEN_BASE   = 160;
  const OPEN_STEP   = 95;
  const OPEN_DUR    = 1100;

  const CLOSE_BASE  = 0;
  const CLOSE_STEP  = 95;
  const CLOSE_DUR   = 900;

  let lines = [];
  let openTimer = null;
  let closeTimer = null;

  function collectLines() {
    lines = [];

    const lead = infoCont.querySelector('.lead');
    if (lead) lines.push(lead);

    infoCont.querySelectorAll('.roles span').forEach((node) => lines.push(node));

    const founders = infoCont.querySelector('.founders');
    if (founders) lines.push(founders);

    lines.forEach((el) => el.classList.add('line'));
  }

  function setOpenDelays() {
    lines.forEach((el, index) => {
      el.style.setProperty('--delay-open', `${OPEN_BASE + index * OPEN_STEP}ms`);
    });
  }

  function setCloseDelays() {
    const count = lines.length;
    lines.forEach((el, index) => {
      const revIndex = count - 1 - index;
      el.style.setProperty('--delay-close', `${CLOSE_BASE + revIndex * CLOSE_STEP}ms`);
    });
  }

  function totalOpenMs() {
    const count = Math.max(lines.length, 1);
    return OPEN_BASE + (count - 1) * OPEN_STEP + OPEN_DUR;
  }

  function totalCloseMs() {
    const count = Math.max(lines.length, 1);
    return CLOSE_BASE + (count - 1) * CLOSE_STEP + CLOSE_DUR;
  }

  function fitInfo() {
    const panelStyles = getComputedStyle(infoPanel);
    const padTop = parseFloat(panelStyles.paddingTop) || 0;
    const padBottom = parseFloat(panelStyles.paddingBottom) || 0;
    const available = infoPanel.clientHeight - padTop - padBottom;

    infoFit.style.transform = 'scale(1)';
    const needed = infoFit.scrollHeight;

    let scale = 1;
    if (available > 0 && needed > available) {
      scale = Math.max(0.75, available / needed);
    }

    infoFit.style.transform = `scale(${scale})`;
  }

  function openPanel() {
    if (menuBtn.getAttribute('aria-expanded') === 'true') {
      return;
    }

    clearTimeout(closeTimer);
    closeTimer = null;

    collectLines();
    setOpenDelays();

    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    root.classList.remove('panel-closing');
    root.classList.add('panel-opening');

    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');

    setTimeout(() => {
      infoPanel.classList.add('is-active');
      infoPanel.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(fitInfo);
    }, 120);

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    openTimer = window.setTimeout(() => {
      root.classList.remove('panel-opening');
      root.classList.add('panel-open');
      openTimer = null;
    }, totalOpenMs() + 150);
  }

  function closePanel() {
    if (menuBtn.getAttribute('aria-expanded') !== 'true' && !root.classList.contains('panel-open')) {
      return;
    }

    clearTimeout(openTimer);
    openTimer = null;

    collectLines();
    setCloseDelays();

    root.classList.add('panel-closing');
    root.classList.remove('panel-opening');
    root.classList.remove('panel-open');

    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');

    const endMs = totalCloseMs();
    closeTimer = window.setTimeout(() => {
      infoPanel.setAttribute('aria-hidden', 'true');
      infoPanel.classList.remove('is-active');

      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      root.classList.remove('panel-closing');

      if (window.__unfreezeSafeAreas) window.__unfreezeSafeAreas();
      closeTimer = null;
    }, endMs + 100);
  }

  function togglePanel() {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closePanel();
    } else {
      openPanel();
    }
  }

  menuBtn.addEventListener('click', togglePanel);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
  });

  infoPanel.addEventListener('click', (event) => {
    if (event.target === event.currentTarget || !infoCont.contains(event.target)) {
      closePanel();
    }
  });

  function handleResize() {
    if (infoPanel.getAttribute('aria-hidden') === 'false') {
      fitInfo();
    }
  }

  window.addEventListener('resize', handleResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize, { passive: true });
  }

  collectLines();
  setOpenDelays();
  setCloseDelays();

  infoPanel.classList.remove('is-active');
  infoPanel.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
  root.classList.remove('panel-open', 'panel-opening', 'panel-closing');
})();
