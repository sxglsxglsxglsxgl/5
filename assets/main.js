// assets/main.js
(function () {
  const root      = document.documentElement;
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const infoFit   = infoPanel.querySelector('.info-fit');
  const infoCont  = infoPanel.querySelector('.info-content');

  let showTimer = null;
  let finalizeTimer = null;
  let closeTimer = null;
  let panelDelay = 120;
  let panelDuration = 1600;

  function parseTimeValue(value){
    if (!value) return 0;
    const trimmed = `${value}`.trim();
    if (!trimmed) return 0;
    if (trimmed.endsWith('ms')) return parseFloat(trimmed);
    if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000;
    const numeric = parseFloat(trimmed);
    return Number.isNaN(numeric) ? 0 : numeric;
  }

  function updatePanelTiming(){
    const styles = getComputedStyle(root);
    const delayValue = parseTimeValue(styles.getPropertyValue('--panel-delay'));
    const durationValue = parseTimeValue(styles.getPropertyValue('--panel-duration'));

    panelDelay = delayValue || panelDelay;
    panelDuration = durationValue || panelDuration;
  }

  updatePanelTiming();

  function prepareLines(){
    const nodes = [];
    const lead = infoCont.querySelector('.lead');
    if (lead) nodes.push(lead);

    infoCont.querySelectorAll('.roles span').forEach((node) => nodes.push(node));

    const founders = infoCont.querySelector('.founders');
    if (founders) nodes.push(founders);

    nodes.forEach((el, index) => {
      el.classList.add('line');
      el.style.setProperty('--delay', `${160 + index * 95}ms`);
    });
  }

  function fitInfo(){
    const panelStyles = getComputedStyle(infoPanel);
    const padTop = parseFloat(panelStyles.paddingTop) || 0;
    const padBottom = parseFloat(panelStyles.paddingBottom) || 0;
    const available = infoPanel.clientHeight - padTop - padBottom;

    infoFit.style.setProperty('--panel-scale', '1');
    infoFit.style.transform = 'scale(1)';
    root.style.setProperty('--panel-scale', '1');

    const needed = infoFit.scrollHeight;
    let scale = 1;
    if (needed > available && available > 0){
      scale = Math.max(0.6, available / needed);
    }

    root.style.setProperty('--panel-scale', `${scale}`);
    infoFit.style.transform = `scale(${scale})`;
  }

  function clearOpenTimers(){
    if (showTimer){
      clearTimeout(showTimer);
      showTimer = null;
    }
    if (finalizeTimer){
      clearTimeout(finalizeTimer);
      finalizeTimer = null;
    }
  }

  function clearCloseTimer(){
    if (closeTimer){
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function openPanel() {
    if (!menuBtn || menuBtn.getAttribute('aria-expanded') === 'true') return;

    clearCloseTimer();
    updatePanelTiming();

    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    root.classList.remove('panel-closing');
    root.classList.add('panel-opening');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded','true');

    showTimer = window.setTimeout(() => {
      prepareLines();
      infoPanel.setAttribute('aria-hidden','false');
      requestAnimationFrame(() => {
        fitInfo();
      });
    }, panelDelay);

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    finalizeTimer = window.setTimeout(() => {
      root.classList.remove('panel-opening');
      root.classList.add('panel-open');
      finalizeTimer = null;
    }, panelDelay + panelDuration);
  }

  function closePanel() {
    if (!menuBtn) return;

    clearOpenTimers();
    clearCloseTimer();
    updatePanelTiming();

    const isOpening = root.classList.contains('panel-opening');
    const isOpen = root.classList.contains('panel-open');
    if (!isOpening && !isOpen && menuBtn.getAttribute('aria-expanded') !== 'true') {
      return;
    }

    root.classList.remove('panel-opening');
    root.classList.add('panel-closing');
    root.classList.remove('panel-open');

    infoPanel.setAttribute('aria-hidden','true');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded','false');

    closeTimer = window.setTimeout(() => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      root.classList.remove('panel-closing');

      if (window.__unfreezeSafeAreas) window.__unfreezeSafeAreas();
      closeTimer = null;
    }, panelDelay + panelDuration);
  }

  function togglePanel(){
    if (!menuBtn) return;
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  }

  if (menuBtn){
    menuBtn.addEventListener('click', togglePanel);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
  });

  infoPanel.addEventListener('click', (event) => {
    const content = infoCont;
    if (event.target === event.currentTarget || !content.contains(event.target)) {
      closePanel();
    }
  });

  window.addEventListener('resize', () => {
    updatePanelTiming();
    if (infoPanel.getAttribute('aria-hidden') === 'false') {
      fitInfo();
    }
  });
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', () => {
      updatePanelTiming();
      if (infoPanel.getAttribute('aria-hidden') === 'false') {
        fitInfo();
      }
    }, { passive: true });
  }

  infoPanel.setAttribute('aria-hidden','true');
  if (menuBtn){
    menuBtn.setAttribute('aria-expanded','false');
  }
  root.classList.remove('panel-open','panel-opening','panel-closing');
})();
