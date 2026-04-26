(() => {
  let btnInjected = false;
  let pollingInterval = null;
  let active = false;

  // === SAFEGUARDS ===
  const MAX_PER_MINUTE = 3;        // Max retry clicks per minute
  const MAX_TOTAL = 50;            // Max total retries per session, then auto-stop
  const COOLDOWN_MS = 30000;       // 30s cooldown before retrying the same button

  let retriesThisMinute = 0;
  let totalRetries = 0;
  const recentlyRetried = new WeakMap(); // button → timestamp of last retry

  // Reset per-minute counter every 60s
  setInterval(() => { retriesThisMinute = 0; }, 60000);

  console.log('[LTX Retry All] Content script loaded on:', window.location.href);
  console.log(`[LTX Retry All] Limits: ${MAX_PER_MINUTE}/min, ${MAX_TOTAL} total, ${COOLDOWN_MS / 1000}s cooldown`);

  function retryAll(statusLabel) {
    if (totalRetries >= MAX_TOTAL) {
      console.log(`[LTX Retry All] Session limit reached (${MAX_TOTAL}). Stopping.`);
      if (statusLabel) statusLabel.textContent = `Auto Retry (limit: ${MAX_TOTAL})`;
      return 0;
    }

    const now = Date.now();
    let clicked = 0;

    document.querySelectorAll('button').forEach(b => {
      if (!b.textContent.includes('Retry')) return;

      // Check per-minute rate limit
      if (retriesThisMinute >= MAX_PER_MINUTE) return;

      // Check per-button cooldown
      const lastRetry = recentlyRetried.get(b);
      if (lastRetry && (now - lastRetry) < COOLDOWN_MS) return;

      // Check total limit
      if (totalRetries >= MAX_TOTAL) return;

      b.click();
      clicked++;
      retriesThisMinute++;
      totalRetries++;
      recentlyRetried.set(b, now);
    });

    if (clicked > 0) {
      console.log(`[LTX Retry All] Retried ${clicked} (${retriesThisMinute}/${MAX_PER_MINUTE} this min, ${totalRetries}/${MAX_TOTAL} total)`);
    }

    // Auto-disable if total limit reached
    if (totalRetries >= MAX_TOTAL && active) {
      console.log('[LTX Retry All] Total limit reached, auto-disabling.');
      active = false;
      stopPolling();
    }

    return clicked;
  }

  function startPolling(statusLabel) {
    if (pollingInterval) return;
    pollingInterval = setInterval(() => {
      if (active) retryAll(statusLabel);
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
    btn.title = `Auto-retry failed generations (${MAX_PER_MINUTE}/min, ${MAX_TOTAL} max, ${COOLDOWN_MS / 1000}s cooldown)`;

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
      if (!active && totalRetries >= MAX_TOTAL) {
        label.textContent = `Auto Retry (limit: ${MAX_TOTAL})`;
      } else if (!active) {
        label.textContent = 'Auto Retry';
      } else {
        label.textContent = 'Auto Retry';
      }
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();

      // Allow re-enabling even after limit by resetting counters
      if (!active && totalRetries >= MAX_TOTAL) {
        totalRetries = 0;
        retriesThisMinute = 0;
        console.log('[LTX Retry All] Counters reset');
      }

      active = !active;
      updateUI();

      if (active) {
        retryAll(label);
        startPolling(label);
      } else {
        stopPolling();
        updateUI();
      }
    });

    // Clicking the button does one manual pass (respects rate limits)
    btn.addEventListener('click', () => {
      retryAll(label);
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
