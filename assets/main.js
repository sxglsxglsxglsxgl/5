// assets/main.js
(function () {
  const infoBtn = document.getElementById('infoBtn');
  const infoPanel = document.getElementById('infoPanel');

  function openPanel() {
    infoBtn.setAttribute('aria-expanded', 'true');
    infoPanel.setAttribute('aria-hidden', 'false');
  }

  function closePanel() {
    infoBtn.setAttribute('aria-expanded', 'false');
    infoPanel.setAttribute('aria-hidden', 'true');
  }

  function togglePanel() {
    const expanded = infoBtn.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  }

  infoBtn.addEventListener('click', togglePanel);

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  // Клик вне содержимого панели (если открыта)
  infoPanel.addEventListener('click', (e) => {
    // Закрываем, если кликнули по фону панели, а не по контенту
    if (e.target === infoPanel) closePanel();
  });

  // Стартовое состояние — панель скрыта
  closePanel();
})();
