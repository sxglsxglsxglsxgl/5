// assets/main.js
(function () {
  const root      = document.documentElement;
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const infoCont  = infoPanel.querySelector('.info-content');
  const infoFit   = infoPanel.querySelector('.info-fit') || infoPanel;
  const wipe      = infoPanel.querySelector('.panel-wipe');

  const OPEN_BASE = 160, OPEN_STEP = 95, OPEN_DUR = 1100;
  const CLOSE_BASE = 0, CLOSE_STEP = 95, CLOSE_DUR = 900;
  const easing = 'cubic-bezier(.16,1,.3,1)';

  let state = 'closed'; // closed | opening | open | closing

  function collectLines() {
    const lines = [];
    const lead = infoCont.querySelector('.lead'); if (lead) lines.push(lead);
    infoCont.querySelectorAll('.roles span').forEach(n => lines.push(n));
    const founders = infoCont.querySelector('.founders'); if (founders) lines.push(founders);
    return lines;
  }

  // Автофит текста в панель
  function fitInfo(){
    const s = getComputedStyle(infoPanel);
    const padTop = parseFloat(s.paddingTop);
    const padBottom = parseFloat(s.paddingBottom);
    const avail = infoPanel.clientHeight - padTop - padBottom;

    infoFit.style.transform = 'scale(1)';
    const need = infoFit.scrollHeight;

    let scale = 1;
    if (need > avail) scale = Math.max(0.75, avail / need);
    infoFit.style.transform = `scale(${scale})`;
  }

  async function animateOpenLines(lines) {
    lines.forEach((el, i) => {
      el.style.opacity = '0';
      el.animate(
        [
          { opacity: 0, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        {
          duration: OPEN_DUR,
          delay: OPEN_BASE + i * OPEN_STEP,
          easing,
          fill: 'forwards'
        }
      );
    });
    const lastDelay = OPEN_BASE + (lines.length - 1) * OPEN_STEP;
    return new Promise(res => setTimeout(res, lastDelay + OPEN_DUR));
  }

  async function animateCloseLines(lines) {
    const n = lines.length;
    lines.forEach((el, i) => {
      const rev = n - 1 - i;
      el.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-14px)' }
        ],
        {
          duration: CLOSE_DUR,
          delay: CLOSE_BASE + rev * CLOSE_STEP,
          easing,
          fill: 'forwards'
        }
      );
    });
    const lastDelay = CLOSE_BASE + (n - 1) * CLOSE_STEP;
    return new Promise(res => setTimeout(res, lastDelay + CLOSE_DUR));
  }

  function animateWipeUp() {
    if (!wipe) return Promise.resolve();
    wipe.style.height = '0px';
    wipe.offsetHeight; // рефлоу
    const anim = wipe.animate(
      [{ height: '0px' }, { height: '100%' }],
      { duration: CLOSE_DUR, easing, fill: 'forwards' }
    );
    return anim.finished.catch(() => {});
  }

  function resetWipe() {
    if (!wipe) return;
    wipe.style.height = '0px';
  }

  async function openPanel() {
    if (state !== 'closed') return;
    state = 'opening';
    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    root.classList.add('panel-opening');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded','true');

    // показываем панель
    infoPanel.setAttribute('aria-hidden','false');
    requestAnimationFrame(fitInfo);

    const lines = collectLines();
    await animateOpenLines(lines);

    root.classList.remove('panel-opening');
    root.classList.add('panel-open');

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    state = 'open';
  }

  async function closePanel() {
    if (state !== 'open') return;
    state = 'closing';

    root.classList.add('panel-closing');
    root.classList.remove('panel-open');

    const lines = collectLines();
    await Promise.all([ animateCloseLines(lines), animateWipeUp() ]);

    // только теперь скрываем панель
    infoPanel.setAttribute('aria-hidden','true');
    resetWipe();

    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded','false');

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    root.classList.remove('panel-closing');
    if (window.__unfreezeSafeAreas) window.__unfreezeSafeAreas();

    state = 'closed';
  }

  function togglePanel(){
    if (state === 'closed') openPanel();
    else if (state === 'open') closePanel();
  }

  menuBtn.addEventListener('click', togglePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
  infoPanel.addEventListener('click', (e) => {
    if (e.target === infoPanel) closePanel();
  });

  const fitIfOpen = () => { if (state === 'open') fitInfo(); };
  window.addEventListener('resize', fitIfOpen);
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', fitIfOpen, { passive:true });
  }

  infoPanel.setAttribute('aria-hidden','true');
})();
