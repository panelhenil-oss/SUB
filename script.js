/* ==========================================================
   LINK VAULT — logika za "zaprati da otključaš"

   ✏️  SVE ŠTO TREBA DA MENJAŠ JE OVDE DOLE, U "CONFIG":
   ========================================================== */
const CONFIG = {
  // Link ka tvom profilu (Instagram / TikTok / YouTube / Discord...)
  followUrl: "https://instagram.com/tvoj_nalog",

  // Tekst na dugmetu za korak 1
  followLabel: "Zaprati me",

  // PRAVI link koji se otključava (ovo dobijaju tek nakon što zaprate)
  mainUrl: "https://example.com/tvoj-pravi-link",

  // Tekst na dugmetu za korak 2
  mainLabel: "Otvori Link",

  // Minimalno vreme (u sekundama) koje mora proći OD TRENUTKA KLIKA na
  // "Zaprati me" pre nego što se link otključa — bez obzira kad se
  // korisnik vrati na ovaj tab. Ako se vrati ranije, spinner samo
  // nastavlja da se vrti dok ne prođe ovo vreme.
  minWaitSeconds: 8,
};

/* ==========================================================
   Od ovde na dole ne treba ništa da diraš.
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

  // Postavi tekstove i linkove iz CONFIG-a
  followBtn.href = CONFIG.followUrl;
  followBtnText.textContent = CONFIG.followLabel;
  mainBtnText.textContent = CONFIG.mainLabel;

  const MIN_WAIT_MS = CONFIG.minWaitSeconds * 1000;
  // Da se spinner uvek makar malo vidi i kad se korisnik vrati kasno.
  const MIN_SPINNER_MS = 900;

  // Sve se pamti preko sessionStorage — vreme klika i da li je
  // otključano, tako da osvežavanje stranice usred procesa ne resetuje
  // odbrojavanje niti dozvoljava "varanje" ponovnim učitavanjem.
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
    // Ako je stranica osvežena dok se već čekalo, nastavi odbrojavanje.
    statusText.textContent = 'Vrati se na ovaj tab kad zaprati\u0161 — link se sam otključava.';
    statusText.classList.add('is-active');
    handleReturnToTab();
  }

  // Korak 1: klik na "Zaprati me"
  followBtn.addEventListener('click', () => {
    if (clickTime) return; // već kliknuto, ne resetuj tajmer
    clickTime = Date.now();
    sessionStorage.setItem('lv_clickTime', String(clickTime));
    setFollowDoneUI();
    statusText.textContent = 'Otvorio sam stranicu za praćenje — vrati se ovde nakon što zaprati\u0161.';
    statusText.classList.add('is-active');
  });

  // Kad se korisnik vrati na ovaj tab (ili ga učita ponovo), proveri
  // koliko je vremena stvarno prošlo od klika i postavi/produži tajmer.
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
    followBtnText.textContent = 'Zaprato ✓';
  }

  function startOrUpdateVerifying(remainingMs) {
    lockOverlay.classList.add('is-verifying');
    statusText.textContent = 'Hvala! Proveravam i otključavam link…';
    statusText.classList.remove('is-active');
    statusText.classList.add('is-done');

    updateCountdownText(remainingMs);

    // Ponovni ulazak na tab ne sme da pravi gomilu paralelnih tajmera.
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
    lockText.textContent = `Proveravam… ${seconds}s`;
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
    lockText.textContent = 'Otključano';

    statusText.textContent = 'Link je otključan. Hvala na pratnji! 🎉';
    statusText.classList.remove('is-active');
    statusText.classList.add('is-done');

    if (!skipToast) {
      showToast('Link otključan! 🎉');
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
