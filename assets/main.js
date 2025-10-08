// assets/main.js
(function () {
  const root      = document.documentElement;
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const infoCont  = infoPanel.querySelector('.info-content');
  const infoFit   = infoPanel.querySelector('.info-fit') || infoPanel;
  const wipe      = infoPanel.querySelector('.panel-wipe');

  // Параметры стадирования
  const OPEN_BASE = 160, OPEN_STEP = 95, OPEN_DUR = 1100;
  const CLOSE_BASE = 0, CLOSE_STEP = 95, CLOSE_DUR = 900;

  const easing = 'cubic-bezier(.16,1,.3,1)';

  let state = 'closed'; // 'opening' | 'open' | 'closing'
  let lineAnimations = []; // активные анимации строк
  let wipeAnimation = null;

  function settleAnimation(anim) {
    if (!anim) return;
    try {
      if (typeof anim.commitStyles === 'function') anim.commitStyles();
    } catch (e) {}
    try { anim.cancel(); } catch (e) {}
  }

  function collectLines() {
    const lines = [];
    const lead = infoCont.querySelector('.lead'); if (lead) lines.push(lead);
    infoCont.querySelectorAll('.roles span').forEach(n => lines.push(n));
    const founders = infoCont.querySelector('.founders'); if (founders) lines.push(founders);
    return lines;
  }

  // Автофит: чтобы контент помещался
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

  function stopAllAnimations() {
    lineAnimations.forEach(settleAnimation);
    lineAnimations = [];
    if (wipeAnimation) {
      settleAnimation(wipeAnimation);
      wipeAnimation = null;
    }
  }

  function animateOpenLines() {
    stopAllAnimations();
    const lines = collectLines();
    // форс-рефлоу, чтобы последующие анимации всегда стартовали
    infoCont.offsetHeight;

    const animations = lines.map((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      const anim = el.animate(
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
      return anim;
    });

    lineAnimations = animations;

    const finished = Promise.all(animations.map(anim => anim.finished.catch(() => {})));

    const lastDelay = lines.length ? OPEN_BASE + (lines.length - 1) * OPEN_STEP : 0;
    return { finished, totalDuration: lastDelay + OPEN_DUR };
  }

  function animateCloseLines() {
    stopAllAnimations();
    const lines = collectLines();
    // рефлоу
    infoCont.offsetHeight;

    // обратный порядок
    const n = lines.length;
    const animations = lines.map((el, i) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      const rev = n - 1 - i;
      const anim = el.animate(
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
      return anim;
    });

    lineAnimations = animations;

    const finished = Promise.all(animations.map(anim => anim.finished.catch(() => {})));

    const lastDelay = n ? CLOSE_BASE + (n - 1) * CLOSE_STEP : 0;
    return { finished, totalDuration: lastDelay + CLOSE_DUR };
  }

  function animateWipeUp(totalDuration) {
    if (!wipe) return Promise.resolve();
    if (wipeAnimation) { try { wipeAnimation.cancel(); } catch(e){} }

    wipe.style.height = '0%';
    // форс-рефлоу
    wipe.offsetHeight;

    wipeAnimation = wipe.animate(
      [{ height: '0%' }, { height: '100%' }],
      { duration: totalDuration || CLOSE_DUR, easing, fill: 'forwards' }
    );
    return wipeAnimation.finished.catch(() => {}).finally(() => {
      wipeAnimation = null;
    });
  }

  function resetWipe() {
    if (!wipe) return;
    if (wipeAnimation) { try { wipeAnimation.cancel(); } catch(e){} }
    wipeAnimation = null;
    wipe.style.height = '0%';
  }

  async function openPanel() {
    if (state !== 'closed') return; // блокируем повторные клики
    state = 'opening';
    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    // слово уходит «в глубину», бургер → крест
    root.classList.add('panel-opening');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded','true');

    // показываем панель чуть позже слова
    setTimeout(() => {
      infoPanel.setAttribute('aria-hidden','false');
      requestAnimationFrame(fitInfo);
    }, 120);

    const { finished: openLines } = animateOpenLines();
    await openLines;

    // фиксация состояния
    root.classList.remove('panel-opening');
    root.classList.add('panel-open');

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    state = 'open';
  }

  async function closePanel() {
    if (state !== 'open') return; // чтобы не требовалось два клика
    state = 'closing';

    root.classList.add('panel-closing');

    // параллельно: строки вверх + шторка снизу
    const { finished: closeLines, totalDuration } = animateCloseLines();
    await Promise.all([ closeLines, animateWipeUp(totalDuration) ]);

    root.classList.remove('panel-open');

    // скрываем панель только ПОСЛЕ анимаций
    infoPanel.setAttribute('aria-hidden','true');

    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded','false');

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    root.classList.remove('panel-closing');
    resetWipe();

    collectLines().forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
    });

    if (window.__unfreezeSafeAreas) window.__unfreezeSafeAreas();

    state = 'closed';
  }

  function togglePanel(){
    if (state === 'closed') openPanel();
    else if (state === 'open') closePanel();
    // если opening/closing — игнор, клики не принимаем
  }

  // Слушатели
  menuBtn.addEventListener('click', togglePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  infoPanel.addEventListener('click', (e) => {
    const content = infoCont;
    if (e.target === e.currentTarget || !content.contains(e.target)) closePanel();
  });

  const fitIfOpen = () => { if (state === 'open') fitInfo(); };
  window.addEventListener('resize', fitIfOpen);
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', fitIfOpen, { passive:true });
  }

  // старт
  infoPanel.setAttribute('aria-hidden','true');
})();
