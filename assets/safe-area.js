// assets/safe-area.js
(function () {
  const docEl = document.documentElement;

  function updateSafeAreaVars() {
    // Базовые env() — как дефолт
    const envTop = parseInt(getComputedStyle(docEl).getPropertyValue('--safe-top')) || 0;
    const envRight = parseInt(getComputedStyle(docEl).getPropertyValue('--safe-right')) || 0;
    const envBottom = parseInt(getComputedStyle(docEl).getPropertyValue('--safe-bottom')) || 0;
    const envLeft = parseInt(getComputedStyle(docEl).getPropertyValue('--safe-left')) || 0;

    let top = envTop, right = envRight, bottom = envBottom, left = envLeft;

    // Доп. вычисления через visualViewport (когда доступно)
    const vv = window.visualViewport;
    if (vv) {
      // Верхний/нижний гэпы из-за браузерного chrome
      const vhGap = window.innerHeight - Math.round(vv.height);
      // Предположительно: верхний инсет = offsetTop
      top = Math.max(top, Math.round(vv.offsetTop));
      // Нижний — остаток
      bottom = Math.max(bottom, Math.max(0, Math.round(vhGap - vv.offsetTop)));

      // Горизонтальные инкрусты
      left = Math.max(left, Math.round(vv.offsetLeft));
      right = Math.max(right, Math.max(0, Math.round((window.innerWidth - Math.round(vv.width)) - vv.offsetLeft)));
    }

    docEl.style.setProperty('--safe-top', `${top}px`);
    docEl.style.setProperty('--safe-right', `${right}px`);
    docEl.style.setProperty('--safe-bottom', `${bottom}px`);
    docEl.style.setProperty('--safe-left', `${left}px`);
  }

  ['resize', 'scroll', 'orientationchange'].forEach(evt =>
    window.addEventListener(evt, updateSafeAreaVars, { passive: true })
  );
  if (window.visualViewport) {
    ['resize', 'scroll'].forEach(evt =>
      window.visualViewport.addEventListener(evt, updateSafeAreaVars, { passive: true })
    );
  }

  // Первичная инициализация
  updateSafeAreaVars();
})();
