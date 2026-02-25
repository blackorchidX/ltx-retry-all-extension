(() => {
  let btnInjected = false;
  let pollingInterval = null;
  let active = false; // Start OFF — user enables when needed

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
      console.log(`[LTX Retry All] Retried ${clicked} items`);
    }
    return clicked;
  }

  function startPolling() {
    if (pollingInterval) return;
    pollingInterval = setInterval(() => {
      if (active) retryAll();
    }, 3000);
    console.log('[LTX Retry All] Auto-retry enabled');
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    console.log('[LTX Retry All] Auto-retry disabled');
  }

  function injectButton() {
    if (btnInjected) return;
    if (!window.location.href.includes('gen-workspace')) return;

    const btn = document.createElement('button');
    btn.id = 'ltx-retry-all-btn';
    btn.title = 'Toggle auto-retry for failed generations';

    // Spinner (hidden by default)
    const spinner = document.createElement('span');
    spinner.className = 'ltx-spinner';
    btn.appendChild(spinner);

    // Label
    const label = document.createElement('span');
    label.className = 'ltx-label';
    label.textContent = 'Auto Retry';
    btn.appendChild(label);

    // Toggle switch
    const toggle = document.createElement('span');
    toggle.className = 'ltx-toggle';
    toggle.innerHTML = '<span class="ltx-toggle-knob"></span>';
    btn.appendChild(toggle);

    function updateUI() {
      toggle.classList.toggle('active', active);
      spinner.classList.toggle('spinning', active);
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      active = !active;
      updateUI();

      if (active) {
        retryAll(); // Immediate pass
        startPolling();
      } else {
        stopPolling();
      }
    });

    // Clicking the button itself does one manual pass (regardless of toggle)
    btn.addEventListener('click', () => {
      retryAll();
    });

    document.body.appendChild(btn);
    btnInjected = true;
    updateUI();
    console.log('[LTX Retry All] Button injected (auto-retry OFF by default)');
  }

  function init() {
    if (!document.body) {
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
