// assets/main.js
(function () {
  const menuBtn   = document.getElementById('menuBtn');
  const infoPanel = document.getElementById('infoPanel');
  const infoClose = document.getElementById('infoClose');
  const root = document.documentElement;

  function openPanel() {
    menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    infoPanel.setAttribute('aria-hidden', 'false');
    root.classList.add('panel-open');
    // блокируем прокрутку фона на iOS
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
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
  if (infoClose) infoClose.addEventListener('click', closePanel);

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
