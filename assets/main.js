// assets/main.js
(function () {
  const root      = document.documentElement;
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const infoFit   = infoPanel.querySelector('.info-fit');
  const infoCont  = infoPanel.querySelector('.info-content');

  let finalizeTimer = null;
  let closeTimer = null;
  let panelDelay = 120;
  let panelDuration = 1600;
  let lineOpenOffset = 160;
  let lineCloseOffset = 0;
  let lineStagger = 95;
  let lineCloseDuration = 1100;

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

    const delayRaw = styles.getPropertyValue('--panel-delay');
    if (delayRaw && delayRaw.trim()){
      panelDelay = parseTimeValue(delayRaw);
    }

    const durationRaw = styles.getPropertyValue('--panel-duration');
    if (durationRaw && durationRaw.trim()){
      panelDuration = parseTimeValue(durationRaw);
    }

    const openOffsetRaw = styles.getPropertyValue('--line-open-offset');
    if (openOffsetRaw && openOffsetRaw.trim()){
      lineOpenOffset = parseTimeValue(openOffsetRaw);
    }

    const closeOffsetRaw = styles.getPropertyValue('--line-close-offset');
    if (closeOffsetRaw && closeOffsetRaw.trim()){
      lineCloseOffset = parseTimeValue(closeOffsetRaw);
    }

    const staggerRaw = styles.getPropertyValue('--line-stagger');
    if (staggerRaw && staggerRaw.trim()){
      lineStagger = parseTimeValue(staggerRaw);
    }

    const closeDurationRaw = styles.getPropertyValue('--line-close-duration');
    if (closeDurationRaw && closeDurationRaw.trim()){
      lineCloseDuration = parseTimeValue(closeDurationRaw);
    }
  }

  updatePanelTiming();

  let lineCache = null;

  function getLineNodes(){
    if (lineCache) return lineCache;

    const nodes = [];
    const lead = infoCont.querySelector('.lead');
    if (lead) nodes.push(lead);

    infoCont.querySelectorAll('.roles span').forEach((node) => nodes.push(node));

    const founders = infoCont.querySelector('.founders');
    if (founders) nodes.push(founders);

    lineCache = nodes;
    return lineCache;
  }

  function formatMs(value){
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '0ms';
    const rounded = Math.round(numeric * 1000) / 1000;
    return `${rounded}ms`;
  }

  function prepareLines(){
    const nodes = getLineNodes();
    if (!nodes.length) return;

    const count = nodes.length;
    nodes.forEach((el, index) => {
      if (!el.classList.contains('line')){
        el.classList.add('line');
      }

      const openDelay = lineOpenOffset + index * lineStagger;
      const closeDelay = lineCloseOffset + (count - index - 1) * lineStagger;

      el.style.setProperty('--delay-open', formatMs(openDelay));
      el.style.setProperty('--delay-close', formatMs(closeDelay));
    });
  }

  function scrubLineAnimations(){
    const nodes = getLineNodes();
    nodes.forEach((el) => {
      el.style.animation = 'none';
    });
    // Force reflow so the browser registers the reset before we remove the override.
    void infoCont.offsetHeight;
    nodes.forEach((el) => {
      el.style.removeProperty('animation');
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
      scale = Math.max(0.4, available / needed);
    }

    root.style.setProperty('--panel-scale', `${scale}`);
    infoFit.style.transform = `scale(${scale})`;
  }

  function clearOpenTimers(){
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
    prepareLines();

    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    root.classList.remove('panel-closing');
    root.classList.add('panel-opening');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded','true');

    scrubLineAnimations();
    infoPanel.classList.add('is-active');
    infoPanel.setAttribute('aria-hidden','false');
    requestAnimationFrame(() => {
      fitInfo();
    });

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
    prepareLines();

    const isOpening = root.classList.contains('panel-opening');
    const isOpen = root.classList.contains('panel-open');
    if (!isOpening && !isOpen && menuBtn.getAttribute('aria-expanded') !== 'true') {
      return;
    }

    root.classList.remove('panel-opening');
    scrubLineAnimations();
    root.classList.add('panel-closing');
    root.classList.remove('panel-open');

    if (!infoPanel.classList.contains('is-active')) {
      infoPanel.classList.add('is-active');
    }
    infoPanel.setAttribute('aria-hidden','false');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded','false');

    const lineNodes = getLineNodes();
    const longestDelay = lineNodes.reduce((max, el) => {
      const value = el.style.getPropertyValue('--delay-close');
      const delay = parseTimeValue(value);
      return Math.max(max, delay);
    }, 0);
    const totalLineTime = longestDelay + lineCloseDuration;
    const settleTime = Math.max(panelDuration, totalLineTime);

    closeTimer = window.setTimeout(() => {
      infoPanel.setAttribute('aria-hidden','true');
      infoPanel.classList.remove('is-active');

      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      root.classList.remove('panel-closing');

      if (window.__unfreezeSafeAreas) window.__unfreezeSafeAreas();
      closeTimer = null;
    }, settleTime);
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
    prepareLines();
    if (infoPanel.getAttribute('aria-hidden') === 'false') {
      fitInfo();
    }
  });
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', () => {
      updatePanelTiming();
      prepareLines();
      if (infoPanel.getAttribute('aria-hidden') === 'false') {
        fitInfo();
      }
    }, { passive: true });
  }

  prepareLines();

  infoPanel.classList.remove('is-active');
  infoPanel.setAttribute('aria-hidden','true');
  if (menuBtn){
    menuBtn.setAttribute('aria-expanded','false');
  }
  root.classList.remove('panel-open','panel-opening','panel-closing');
})();
