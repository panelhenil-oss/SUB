/* ==========================================================
   LINK VAULT — "complete both steps to unlock" logic

   ✏️  EVERYTHING YOU NEED TO CHANGE IS BELOW, IN "CONFIG":
   ========================================================== */
const CONFIG = {
  // Link to your profile (Instagram / TikTok / YouTube / Discord...)
  followUrl: "https://youtube.com/@pelimenmod?si=-n4xiFJR4hRoxnN-",
  followLabel: "Follow Me",

  // Link to the video you want watched & liked
  videoUrl: "https://youtube.com/your-video",
  videoLabel: "Watch & Like",

  // The REAL link that gets unlocked (only revealed after both steps are done)
  mainUrl: "https://youtu.be/dfpSUBsLc8g?si=GvCbWzAPN7EHqYAe",
  mainLabel: "Open Link",

  // Minimum time (in seconds) that must pass FROM THE LATER OF THE TWO
  // CLICKS before the link unlocks — no matter when the user comes back
  // to this tab. If they come back earlier, the spinner just keeps
  // spinning until this time has passed.
  minWaitSeconds: 8,
};

/* ==========================================================
   Nothing below this line needs to be touched.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const followBtn = document.getElementById('followBtn');
  const followBtnText = document.getElementById('followBtnText');
  const videoBtn = document.getElementById('videoBtn');
  const videoBtnText = document.getElementById('videoBtnText');
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
  videoBtn.href = CONFIG.videoUrl;
  videoBtnText.textContent = CONFIG.videoLabel;
  mainBtnText.textContent = CONFIG.mainLabel;

  const MIN_WAIT_MS = CONFIG.minWaitSeconds * 1000;
  // Always show the spinner for at least a moment, even on a late return.
  const MIN_SPINNER_MS = 900;

  // Everything is remembered via sessionStorage — each click's timestamp
  // and whether it's unlocked — so refreshing the page mid-process
  // doesn't reset progress or allow "cheating" by reloading.
  let followClickTime = parseInt(sessionStorage.getItem('lv_followClickTime') || '0', 10) || null;
  let videoClickTime = parseInt(sessionStorage.getItem('lv_videoClickTime') || '0', 10) || null;
  let unlocked = sessionStorage.getItem('lv_unlocked') === '1';
  let verifyTimeoutId = null;
  let countdownIntervalId = null;

  if (followClickTime) setActionDoneUI(followBtn, followBtnText, CONFIG.followLabel);
  if (videoClickTime) setActionDoneUI(videoBtn, videoBtnText, CONFIG.videoLabel);

  if (unlocked) {
    unlockLink(true);
  } else {
    updateWaitingStatus();
    if (followClickTime || videoClickTime) handleReturnToTab();
  }

  // Step 1: click on either action button
  followBtn.addEventListener('click', () => {
    if (followClickTime) return; // already clicked, don't reset the timer
    followClickTime = Date.now();
    sessionStorage.setItem('lv_followClickTime', String(followClickTime));
    setActionDoneUI(followBtn, followBtnText, CONFIG.followLabel);
    updateWaitingStatus();
  });

  videoBtn.addEventListener('click', () => {
    if (videoClickTime) return;
    videoClickTime = Date.now();
    sessionStorage.setItem('lv_videoClickTime', String(videoClickTime));
    setActionDoneUI(videoBtn, videoBtnText, CONFIG.videoLabel);
    updateWaitingStatus();
  });

  // When the user returns to this tab (or reloads it), check whether both
  // steps are done and, if so, how much time has passed since the later
  // click — then set/extend the verifying timer accordingly.
  function handleReturnToTab() {
    if (unlocked) return;
    if (!followClickTime || !videoClickTime) {
      updateWaitingStatus();
      return;
    }

    const lastClick = Math.max(followClickTime, videoClickTime);
    const elapsed = Date.now() - lastClick;
    const remaining = Math.max(MIN_WAIT_MS - elapsed, MIN_SPINNER_MS);

    startOrUpdateVerifying(remaining);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handleReturnToTab();
  });
  window.addEventListener('focus', handleReturnToTab);

  function setActionDoneUI(btn, textEl, originalLabel) {
    btn.classList.add('is-done');
    textEl.textContent = `${originalLabel} \u2713`;
  }

  function updateWaitingStatus() {
    const doneCount = (followClickTime ? 1 : 0) + (videoClickTime ? 1 : 0);
    if (doneCount === 0) {
      statusText.textContent = 'Waiting for you to complete both steps above…';
      statusText.classList.remove('is-active', 'is-done');
    } else if (doneCount === 1) {
      statusText.textContent = '1 of 2 done — complete the other step too, then come back here.';
      statusText.classList.add('is-active');
      statusText.classList.remove('is-done');
    }
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

    statusText.textContent = 'Link unlocked. Thanks for the support! 🎉';
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
