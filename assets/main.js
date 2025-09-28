(function () {
  const root      = document.documentElement;
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const infoCont  = infoPanel.querySelector('.info-content');
  const infoFit   = infoPanel.querySelector('.info-fit') || infoPanel;
  const wipe      = infoPanel.querySelector('.panel-wipe');

  // параметры стадирования для строк
  const OPEN_BASE = 160, OPEN_STEP = 95, OPEN_DUR = 1100;
  const CLOSE_BASE = 0, CLOSE_STEP = 95, CLOSE_DUR = 900;

  let lines = [];
  let animating = false;

  function collectLines() {
    lines = [];
    const lead = infoCont.querySelector('.lead'); if (lead) lines.push(lead);
    infoCont.querySelectorAll('.roles span').forEach(n => lines.push(n));
    const founders = infoCont.querySelector('.founders'); if (founders) lines.push(founders);

    // Обозначим строки и сбросим прошлые анимации, чтобы Safari переигрывал
    lines.forEach(el => {
      el.classList.add('line');
      el.style.animation = 'none';
      // форс-рефлоу:
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;
      el.style.animation = '';
    });
  }

  function setOpenDelays() {
    lines.forEach((el, i) => {
      el.style.setProperty('--delay-open', `${OPEN_BASE + i * OPEN_STEP}ms`);
      el.style.removeProperty('--delay-close');
    });
  }
  function setCloseDelays() {
    const n = lines.length;
    lines.forEach((el, i) => {
      const rev = n - 1 - i; // обратный порядок
      el.style.setProperty('--delay-close', `${CLOSE_BASE + rev * CLOSE_STEP}ms`);
      el.style.removeProperty('--delay-open');
    });
  }

  // Дожидаемся конца всех строк (по animationend)
  function waitLinesEnd(mode /* 'open' | 'close' */) {
    return new Promise(resolve => {
      if (!lines.length) return resolve();

      const prop = (mode === 'open') ? '--delay-open' : '--delay-close';
      // найдём «последнюю» по задержке строку и повесим на неё слушатель
      let maxDelay = -1, last = lines[0];
      lines.forEach(el => {
        const d = parseInt(getComputedStyle(el).getPropertyValue(prop)) || 0;
        if (d > maxDelay) { maxDelay = d; last = el; }
      });

      const styles = getComputedStyle(last);
      const targetName = mode === 'open' ? 'line-open' : 'line-close';
      const names = styles.animationName.split(',').map(name => name.trim());
      const durations = styles.animationDuration.split(',').map(time => parseFloat(time) || 0);
      let matchedDuration = 0;
      for (let idx = 0; idx < names.length; idx += 1) {
        if (names[idx] === targetName) {
          matchedDuration = durations[idx] || 0;
        }
      }

      if (!names.includes(targetName) || matchedDuration === 0) {
        resolve();
        return;
      }

      const handler = (e) => {
        if (e.animationName === targetName) {
          last.removeEventListener('animationend', handler);
          resolve();
        }
      };
      last.addEventListener('animationend', handler, { once: true });
    });
  }

  // Автофит: чтобы текст влезал в панель
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

  async function openPanel() {
    if (animating) return;
    animating = true;

    if (window.__freezeSafeAreas) window.__freezeSafeAreas();

    // 1) слово уходит «в глубину», бургер → крест
    root.classList.add('panel-opening');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded','true');

    // 2) подготовка строк
    collectLines();
    setOpenDelays();

    // 3) показываем панель чуть позже слова
    setTimeout(() => {
      infoPanel.setAttribute('aria-hidden','false');
      requestAnimationFrame(fitInfo);
    }, 120);

    // 4) ждём завершения постройки строк
    await waitLinesEnd('open');

    root.classList.remove('panel-opening');
    root.classList.add('panel-open');

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    animating = false;
  }

  async function closePanel() {
    if (animating) return;
    animating = true;

    // 1) ставим класс закрытия (строки поедут вверх), корневой open снимаем
    root.classList.add('panel-closing');
    root.classList.remove('panel-open');

    collectLines();
    setCloseDelays();

    // 2) параллельно запускаем wipe: он стартует сам по CSS,
    //    но дождёмся конкретно его transitionend
    const wipeEnd = new Promise(resolve => {
      const computed = getComputedStyle(wipe);
      const durations = computed.transitionDuration.split(',').map(time => parseFloat(time) || 0);
      const totalDuration = Math.max(...durations);
      if (totalDuration === 0) {
        resolve();
        return;
      }

      const onEnd = (e) => {
        if (e.propertyName === 'height') {
          wipe.removeEventListener('transitionend', onEnd);
          resolve();
        }
      };
      wipe.addEventListener('transitionend', onEnd, { once: true });
    });

    // 3) ждём конца строк И конца шторки
    await Promise.all([ waitLinesEnd('close'), wipeEnd ]);

    // 4) только теперь скрываем панель и возвращаем состояние
    infoPanel.setAttribute('aria-hidden','true');

    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded','false');

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    root.classList.remove('panel-closing');

    if (window.__unfreezeSafeAreas) window.__unfreezeSafeAreas();

    // Сбросим высоту шторки (на следующее открытие она должна быть 0)
    // форс-рефлоу, чтобы transition высоты снова отработал в Safari
    wipe.style.transition = 'none';
    wipe.style.height = '0';
    // eslint-disable-next-line no-unused-expressions
    wipe.offsetHeight;
    wipe.style.transition = '';

    animating = false;
  }

  function togglePanel(){
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  }

  menuBtn.addEventListener('click', togglePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  // Клик по фону панели — закрыть
  infoPanel.addEventListener('click', (e) => {
    const content = infoCont;
    if (e.target === e.currentTarget || !content.contains(e.target)) closePanel();
  });

  // Перефит при изменениях вьюпорта
  const fitIfOpen = () => { if (infoPanel.getAttribute('aria-hidden') === 'false') fitInfo(); };
  window.addEventListener('resize', fitIfOpen);
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', fitIfOpen, { passive:true });
  }

  // старт
  infoPanel.setAttribute('aria-hidden','true');
})();
