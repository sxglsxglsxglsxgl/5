// assets/main.js
(function () {
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const root = document.documentElement;

  function openPanel() {
    // 1) сначала "углубляем" слово и меняем бургер → крест
    root.classList.add('panel-open');
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');

    // 2) задаём небольшую задержку для панели (мягкое стадирование)
    root.style.setProperty('--panel-delay', '.12s');

    // 3) показываем панель
    infoPanel.setAttribute('aria-hidden', 'false');

    // 4) блокируем фон
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    // без задержки на закрытие
    root.style.setProperty('--panel-delay', '0s');

    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    infoPanel.setAttribute('aria-hidden', 'true');
    root.classList.remove('panel-open');

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function togglePanel() {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  }

  menuBtn.addEventListener('click', togglePanel);
  // Закрытие по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  // Клик по фону (вне контента) — закрыть
  infoPanel.addEventListener('click', (e) => {
    const content = e.currentTarget.querySelector('.info-content');
    if (e.target === e.currentTarget || !content.contains(e.target)) {
      closePanel();
    }
  });

  // Старт: панель скрыта
  closePanel();
})();
