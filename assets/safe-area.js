// assets/safe-area.js
(function () {
  const docEl = document.documentElement;

  function readNumberVar(name) {
    const value = getComputedStyle(docEl).getPropertyValue(name).trim();
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function updateSafeAreaVars() {
    const vv = window.visualViewport;
    let top = readNumberVar('--safe-top');
    let right = readNumberVar('--safe-right');
    let bottom = readNumberVar('--safe-bottom');
    let left = readNumberVar('--safe-left');

    if (vv) {
      const viewportWidth = Math.round(vv.width);
      const windowWidth = window.innerWidth;
      const viewportHeight = Math.round(vv.height);
      const windowHeight = window.innerHeight;
      const offsetTop = Math.round(vv.offsetTop);
      const offsetLeft = Math.round(vv.offsetLeft);
      const verticalGap = Math.max(0, windowHeight - viewportHeight);

      top = Math.max(top, offsetTop);
      left = Math.max(left, offsetLeft);
      right = Math.max(right, Math.max(0, (windowWidth - viewportWidth) - offsetLeft));
      bottom = Math.max(bottom, Math.max(0, verticalGap - offsetTop));
    }

    if (!docEl.classList.contains('panel-open')) {
      docEl.style.setProperty('--safe-top-active', `${top}px`);
      docEl.style.setProperty('--safe-right-active', `${right}px`);
      docEl.style.setProperty('--safe-bottom-active', `${bottom}px`);
      docEl.style.setProperty('--safe-left-active', `${left}px`);
    }
  }

  ['resize', 'scroll', 'orientationchange'].forEach((eventName) => {
    window.addEventListener(eventName, updateSafeAreaVars, { passive: true });
  });

  if (window.visualViewport) {
    ['resize', 'scroll'].forEach((eventName) => {
      window.visualViewport.addEventListener(eventName, updateSafeAreaVars, { passive: true });
    });
  }

  window.__freezeSafeAreas = function freeze() {
    const top = readNumberVar('--safe-top-active');
    const right = readNumberVar('--safe-right-active');
    const bottom = readNumberVar('--safe-bottom-active');
    const left = readNumberVar('--safe-left-active');

    docEl.style.setProperty('--safe-top-active', `${top}px`);
    docEl.style.setProperty('--safe-right-active', `${right}px`);
    docEl.style.setProperty('--safe-bottom-active', `${bottom}px`);
    docEl.style.setProperty('--safe-left-active', `${left}px`);
  };

  window.__unfreezeSafeAreas = function unfreeze() {
    updateSafeAreaVars();
  };

  updateSafeAreaVars();
})();
