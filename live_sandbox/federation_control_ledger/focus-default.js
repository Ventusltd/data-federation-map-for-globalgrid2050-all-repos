(function(){
  let suppress = false;

  function applyQuietDefault(){
    const nav = document.getElementById('layerNav');
    if (!nav || suppress) return false;
    const buttons = Array.from(nav.querySelectorAll('[data-layer]'));
    if (!buttons.length) return false;
    suppress = true;
    buttons.forEach((button) => {
      if (button.dataset.layer !== 'core' && button.classList.contains('active')) {
        button.click();
      }
    });
    suppress = false;
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

  function watchLayerNav(){
    const nav = document.getElementById('layerNav');
    if (!nav) return;
    const observer = new MutationObserver(() => {
      window.setTimeout(applyQuietDefault, 80);
    });
    observer.observe(nav, { childList: true });
  }

  window.addEventListener('load', () => {
    window.setTimeout(waitThenApply, 200);
    window.setTimeout(watchLayerNav, 500);
  });

  document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'resetButton') {
      window.setTimeout(waitThenApply, 300);
    }
  });
})();
