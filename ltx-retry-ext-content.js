(() => {
  let btnInjected = false;
  let totalRetries = 0;
  let pollingInterval = null;
  let active = true;

  console.log('[LTX Retry All] Content script loaded on:', window.location.href);

  function retryAll() {
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
    }

    return clicked;
  }

  function updateLabel(btn, text) {
    // Keep the toggle icon on the right
    btn.querySelector('.ltx-label').textContent = text;
  }

  function startPolling(btn) {
    if (pollingInterval) return;

    console.log('[LTX Retry All] Auto-retry polling started');
    updateLabel(btn, '👀 Watching...');

    pollingInterval = setInterval(() => {
      if (!active) return;

      const clicked = retryAll();
      if (clicked > 0) {
        updateLabel(btn, `🔄 Retrying ${clicked}... (${totalRetries} total)`);
        setTimeout(() => {
          if (active) updateLabel(btn, `👀 Watching... (${totalRetries} retried)`);
        }, 2000);
      }
    }, 3000);
  }

  function stopPolling(btn) {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    console.log('[LTX Retry All] Auto-retry paused');
    updateLabel(btn, `⏸ Paused${totalRetries > 0 ? ` (${totalRetries} retried)` : ''}`);
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
    btn.title = 'Auto-retries failed generations. Click the toggle to enable/disable.';

    // Label span
    const label = document.createElement('span');
    label.className = 'ltx-label';
    label.textContent = '👀 Watching...';
    btn.appendChild(label);

    // Toggle switch
    const toggle = document.createElement('span');
    toggle.className = 'ltx-toggle active';
    toggle.innerHTML = '<span class="ltx-toggle-knob"></span>';
    btn.appendChild(toggle);

    // Clicking the toggle switches on/off
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      active = !active;
      toggle.classList.toggle('active', active);

      if (active) {
        startPolling(btn);
      } else {
        stopPolling(btn);
      }
    });

    // Clicking the button itself does a manual retry pass
    btn.addEventListener('click', () => {
      if (!active) return;
      const clicked = retryAll();
      if (clicked === 0) {
        updateLabel(btn, '✅ Nothing to retry');
        setTimeout(() => {
          updateLabel(btn, totalRetries > 0
            ? `👀 Watching... (${totalRetries} retried)`
            : '👀 Watching...');
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

    injectButton();

    const observer = new MutationObserver(() => {
      if (window.location.href.includes('gen-workspace')) {
        injectButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
})();
