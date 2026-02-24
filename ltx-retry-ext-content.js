(() => {
  let btnInjected = false;
  let totalRetries = 0;
  let pollingInterval = null;

  console.log('[LTX Retry All] Content script loaded on:', window.location.href);

  function getRetryButtons() {
    return [...document.querySelectorAll('button')].filter(b =>
      b.textContent.includes('Retry')
    );
  }

  function retryAll(btn) {
    let clicked = 0;
    document.querySelectorAll('button').forEach(b => {
      if (b.textContent.includes('Retry')) {
        b.click();
        clicked++;
      }
    });

    if (clicked > 0) {
      totalRetries += clicked;
      console.log(`[LTX Retry All] Auto-retried ${clicked} (total: ${totalRetries})`);
      btn.innerHTML = `🔄 Retrying ${clicked}... (${totalRetries} total)`;
      setTimeout(() => {
        btn.innerHTML = `👀 Watching... (${totalRetries} retried)`;
      }, 2000);
    }

    return clicked;
  }

  function startPolling(btn) {
    if (pollingInterval) return;

    console.log('[LTX Retry All] Auto-retry polling started');
    btn.innerHTML = '👀 Watching...';

    pollingInterval = setInterval(() => {
      retryAll(btn);
    }, 3000);
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
    btn.innerHTML = '👀 Watching...';
    btn.title = 'Auto-retries failed generations. Click for an immediate retry pass.';

    // Manual click for an immediate pass
    btn.addEventListener('click', () => {
      const clicked = retryAll(btn);
      if (clicked === 0) {
        btn.innerHTML = '✅ Nothing to retry';
        setTimeout(() => {
          btn.innerHTML = totalRetries > 0
            ? `👀 Watching... (${totalRetries} retried)`
            : '👀 Watching...';
        }, 2000);
      }
    });

    document.body.appendChild(btn);
    btnInjected = true;
    console.log('[LTX Retry All] Button injected successfully');

    // Start auto-retry polling
    startPolling(btn);
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
