/* ==========================================================
   LINK VAULT — "follow to unlock" logic

   ✏️  EVERYTHING YOU NEED TO CHANGE IS BELOW, IN "CONFIG":
   ========================================================== */
const CONFIG = {
  // Link to your profile (Instagram / TikTok / YouTube / Discord...)
  followUrl: "https://instagram.com/your_account",

  // Text on the step 1 button
  followLabel: "Follow Me",

  // The REAL link that gets unlocked (only revealed after they follow)
  mainUrl: "https://example.com/your-real-link",

  // Text on the step 2 button
  mainLabel: "Open Link",

  // Minimum time (in seconds) that must pass FROM THE MOMENT OF THE CLICK
  // on "Follow Me" before the link unlocks — no matter when the user
  // comes back to this tab. If they come back earlier, the spinner just
  // keeps spinning until this time has passed.
  minWaitSeconds: 8,
};

/* ==========================================================
   Nothing below this line needs to be touched.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const followBtn = document.getElementById('followBtn');
  const followBtnText = document.getElementById('followBtnText');
  const statusText = document.getElementById('statusText');

  const mainBtn = document.getElementById('mainBtn');
  const mainBtnText = document.getElementById('mainBtnText');
  const lockOverlay = document.getElementById('lockOverlay');
  const lockText = document.getElementById('lockText');

  const toast = document.getElementById('toast');
  let toastTimeout = null;

  // Apply text and links from CONFIG
  followBtn.href = CONFIG.followUrl;
  followBtnText.textContent = CONFIG.followLabel;
  mainBtnText.textContent = CONFIG.mainLabel;

  const MIN_WAIT_MS = CONFIG.minWaitSeconds * 1000;
  // Always show the spinner for at least a moment, even on a late return.
  const MIN_SPINNER_MS = 900;

  // Everything is remembered via sessionStorage — the click time and
  // whether it's unlocked — so refreshing the page mid-process doesn't
  // reset the countdown or allow "cheating" by reloading.
  let clickTime = parseInt(sessionStorage.getItem('lv_clickTime') || '0', 10) || null;
  let unlocked = sessionStorage.getItem('lv_unlocked') === '1';
  let verifyTimeoutId = null;
  let countdownIntervalId = null;

  if (clickTime) {
    setFollowDoneUI();
  }

  if (unlocked) {
    unlockLink(true);
  } else if (clickTime) {
    // If the page was refreshed while already waiting, resume the countdown.
    statusText.textContent = 'Come back to this tab after you follow — the link unlocks itself.';
    statusText.classList.add('is-active');
    handleReturnToTab();
  }

  // Step 1: click on "Follow Me"
  followBtn.addEventListener('click', () => {
    if (clickTime) return; // already clicked, don't reset the timer
    clickTime = Date.now();
    sessionStorage.setItem('lv_clickTime', String(clickTime));
    setFollowDoneUI();
    statusText.textContent = 'Opened the follow page — come back here once you\u2019ve followed.';
    statusText.classList.add('is-active');
  });

  // When the user returns to this tab (or reloads it), check how much
  // time has actually passed since the click and set/extend the timer.
  function handleReturnToTab() {
    if (!clickTime || unlocked) return;

    const elapsed = Date.now() - clickTime;
    const remaining = Math.max(MIN_WAIT_MS - elapsed, MIN_SPINNER_MS);

    startOrUpdateVerifying(remaining);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handleReturnToTab();
  });
  window.addEventListener('focus', handleReturnToTab);

  function setFollowDoneUI() {
    followBtn.classList.add('is-done');
    followBtnText.textContent = 'Followed \u2713';
  }

  function startOrUpdateVerifying(remainingMs) {
    lockOverlay.classList.add('is-verifying');
    statusText.textContent = 'Thanks! Verifying and unlocking the link…';
    statusText.classList.remove('is-active');
    statusText.classList.add('is-done');

    updateCountdownText(remainingMs);

    // Re-entering the tab shouldn't stack up parallel timers.
    clearTimeout(verifyTimeoutId);
    clearInterval(countdownIntervalId);

    const target = Date.now() + remainingMs;
    countdownIntervalId = setInterval(() => {
      const left = target - Date.now();
      if (left <= 0) {
        clearInterval(countdownIntervalId);
        return;
      }
      updateCountdownText(left);
    }, 1000);

    verifyTimeoutId = setTimeout(() => {
      clearInterval(countdownIntervalId);
      unlockLink(false);
    }, remainingMs);
  }

  function updateCountdownText(ms) {
    const seconds = Math.max(1, Math.ceil(ms / 1000));
    lockText.textContent = `Verifying… ${seconds}s`;
  }

  function unlockLink(skipToast) {
    unlocked = true;
    clearTimeout(verifyTimeoutId);
    clearInterval(countdownIntervalId);
    sessionStorage.setItem('lv_unlocked', '1');

    mainBtn.href = CONFIG.mainUrl;
    mainBtn.removeAttribute('aria-disabled');
    mainBtn.removeAttribute('tabindex');

    lockOverlay.classList.remove('is-verifying');
    lockOverlay.classList.add('is-unlocked');
    lockText.textContent = 'Unlocked';

    statusText.textContent = 'Link unlocked. Thanks for the follow! 🎉';
    statusText.classList.remove('is-active');
    statusText.classList.add('is-done');

    if (!skipToast) {
      showToast('Link unlocked! 🎉');
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2400);
  }
});
