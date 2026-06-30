(function(){
  function applyQuietDefault(){
    const nav = document.getElementById('layerNav');
    if (!nav) return false;
    const buttons = Array.from(nav.querySelectorAll('[data-layer]'));
    if (!buttons.length) return false;
    buttons.forEach((button) => {
      if (button.dataset.layer !== 'core' && button.classList.contains('active')) {
        button.click();
      }
    });
    return true;
  }

  function waitThenApply(){
    let tries = 0;
    const timer = window.setInterval(() => {
      if (applyQuietDefault() || tries > 80) {
        window.clearInterval(timer);
      }
      tries += 1;
    }, 100);
  }

  window.addEventListener('load', () => window.setTimeout(waitThenApply, 200));
  document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'resetButton') {
      window.setTimeout(waitThenApply, 300);
    }
  });
})();
