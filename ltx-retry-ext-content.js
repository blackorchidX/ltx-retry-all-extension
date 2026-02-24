(() => {
  let btnInjected = false;

  console.log('[LTX Retry All] Content script loaded on:', window.location.href);

  function getRetryButtons() {
    return [...document.querySelectorAll('button')].filter(b =>
      b.textContent.includes('Retry')
    );
  }

  function injectButton() {
    if (btnInjected) return;
    if (!window.location.href.includes('gen-workspace')) {
      console.log('[LTX Retry All] URL does not contain gen-workspace, skipping');
      return;
    }

    console.log('[LTX Retry All] Injecting button...');

    const btn = document.createElement('button');
    btn.id = 'ltx-retry-all-btn';
    btn.innerHTML = '🔄 Retry All';
    btn.title = 'Click all visible Retry buttons, then scrolls to find more';

    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.innerHTML = '⏳ Retrying...';

      let clicked = 0;
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent.includes('Retry')) {
          b.click();
          clicked++;
        }
      });

      console.log(`[LTX Retry All] Clicked ${clicked} Retry buttons`);
      btn.innerHTML = `✅ Retried ${clicked} items`;
      btn.disabled = false;
      setTimeout(() => { btn.innerHTML = '🔄 Retry All'; }, 3000);
    });

    document.body.appendChild(btn);
    btnInjected = true;
    console.log('[LTX Retry All] Button injected successfully');
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function init() {
    if (!document.body) {
      console.log('[LTX Retry All] Waiting for document.body...');
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Try injecting immediately
    injectButton();

    // Watch for SPA navigation
    const observer = new MutationObserver(() => {
      if (window.location.href.includes('gen-workspace')) {
        injectButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
})();
