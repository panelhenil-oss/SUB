/* ==========================================================
   SCRIPT UPDATE — logika (meni igara + kopiranje)
   Ovaj fajl NE treba mijenjati — igre i skripte se mijenjaju
   samo u config.js (Script Update Editor).
   ========================================================== */

(function () {
  const CFG = window.SITE_CONFIG || {};
  const SITE = CFG.site || {};
  const GAMES = CFG.games || [];
  const BRAND = SITE.brand || 'Script Update';
  const escapeHtml0 = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // ---------- Kostur stranice ----------
  document.body.insertAdjacentHTML('beforeend', `
<div class="bg-glow bg-glow--one" aria-hidden="true"></div>
  <div class="bg-glow bg-glow--two" aria-hidden="true"></div>
  <div class="bg-grid" aria-hidden="true"></div>

  <div class="page">

    <!-- ===== STRANICA 1: IZBOR IGRE ===== -->
    <div id="view-menu" class="view">
      <header class="page-header">
        <div class="brand">
          <span class="brand-mark">&gt;_</span>
          <span class="brand-name">{{BRAND}}</span>
        </div>
        <p class="page-subtitle">{{MENU_SUBTITLE}}</p>
      </header>
      <main class="game-grid" id="game-grid"></main>
    </div>

    <!-- ===== STRANICA 2: SKRIPTE ZA IZABRANU IGRU ===== -->
    <div id="view-game" class="view" hidden>
      <header class="page-header">
        <button class="back-btn" type="button" id="back-btn">&larr; All games</button>
        <div class="brand">
          <span class="brand-mark" id="game-mark">&gt;_</span>
          <span class="brand-name" id="game-name">{{BRAND}}</span>
        </div>
        <p class="page-subtitle" id="game-subtitle"></p>
      </header>
      <main class="deck" id="deck"></main>
    </div>

    <footer class="page-footer">
      <p>{{FOOTER}}</p>
    </footer>

  </div>

  <div class="toast" id="toast" role="status" aria-live="polite">Kopirano u clipboard</div>`
    .split('{{BRAND}}').join(escapeHtml0(BRAND))
    .split('{{MENU_SUBTITLE}}').join(escapeHtml0(SITE.menuSubtitle || ''))
    .split('{{FOOTER}}').join(escapeHtml0(SITE.footer || '')));

  const viewMenu = document.getElementById('view-menu');
  const viewGame = document.getElementById('view-game');
  const grid = document.getElementById('game-grid');
  const deck = document.getElementById('deck');
  const toast = document.getElementById('toast');
  let toastTimeout = null;

  const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // ---------- Meni: tasteri za igre ----------
  grid.innerHTML = GAMES.map((g, i) => `
    <a class="game-btn" href="#${encodeURIComponent(g.id)}" style="animation-delay:${i * 0.06}s">
      <span class="game-btn__glow" aria-hidden="true"></span>
      <span class="game-btn__top">
        ${g.icon ? `<img class="game-btn__icon" src="${escapeHtml(g.icon)}" alt="" loading="lazy">` : ''}
        <span class="game-btn__tag">GAME ${String(i + 1).padStart(2, '0')}</span>
      </span>
      <span class="game-btn__name">${escapeHtml(g.name)}</span>
      <span class="game-btn__meta">${g.scripts.length} script${g.scripts.length === 1 ? '' : 's'} &rarr;</span>
    </a>`).join('');

  // ---------- Stranica igre ----------
  function renderGame(game) {
    document.getElementById('game-name').textContent = game.name;
    const mark = document.getElementById('game-mark');
    mark.classList.toggle('brand-mark--img', !!game.icon);
    mark.innerHTML = game.icon ? `<img src="${escapeHtml(game.icon)}" alt="">` : '&gt;_';
    document.getElementById('game-subtitle').textContent = game.subtitle || '';
    document.title = `${game.name} — ${BRAND}`;

    deck.classList.toggle('deck--single', game.scripts.length === 1);
    deck.innerHTML = game.scripts.map((s, i) => `
      <section class="card">
        <div class="card-glow" aria-hidden="true"></div>
        <div class="card-head">
          <span class="card-tag">SLOT ${String(i + 1).padStart(2, '0')}</span>
          <h2 class="card-title">${escapeHtml(s.title)}</h2>
        </div>
        <div class="code-window">
          <div class="code-window__bar">
            <span class="dot dot--red"></span>
            <span class="dot dot--yellow"></span>
            <span class="dot dot--green"></span>
            <span class="code-window__label">${escapeHtml(s.label || game.name + ' Script')}</span>
          </div>
          <pre class="code-body">${escapeHtml(s.code)}</pre>
        </div>
        <button class="copy-btn" type="button" data-copy="${i}"><span class="copy-btn__text">Copy</span></button>
      </section>`).join('');
  }

  // ---------- Prebacivanje između stranica (#id u linku) ----------
  function show(id) {
    const game = GAMES.find((g) => g.id === id);
    if (game) {
      renderGame(game);
      viewMenu.hidden = true;
      viewGame.hidden = false;
    } else {
      document.title = `${BRAND} — Choose Your Game`;
      viewGame.hidden = true;
      viewMenu.hidden = false;
    }
    window.scrollTo(0, 0);
  }

  function setUrl(id) {
    try {
      history.pushState(null, '', id ? '#' + encodeURIComponent(id) : location.pathname + location.search);
    } catch (e) { /* npr. pregled u editoru — nije bitno */ }
  }

  const route = () => show(decodeURIComponent(location.hash.slice(1)));

  grid.addEventListener('click', (e) => {
    const a = e.target.closest('a.game-btn');
    if (!a) return;
    e.preventDefault();
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    show(id);
    setUrl(id);
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    show(null);
    setUrl(null);
  });

  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);
  route();

  // ---------- Copy dugme: svaka skripta ima svoje i kopira samo nju ----------
  deck.addEventListener('click', async (e) => {
    const button = e.target.closest('.copy-btn[data-copy]');
    if (!button) return;
    const body = button.closest('.card').querySelector('.code-body');
    const text = body ? body.textContent.trim() : '';
    if (!text) return showToast('Ova skripta je prazna');

    if (await copyToClipboard(text)) {
      showCopiedState(button);
      showToast('Kopirano u clipboard');
    } else {
      showToast('Kopiranje nije uspjelo — pokušaj ponovo');
    }
  });

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('navigator.clipboard nije uspio, koristim fallback.', err);
      }
    }
    try {
      const t = document.createElement('textarea');
      t.value = text;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.focus();
      t.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(t);
      return ok;
    } catch (err) {
      console.error('Kopiranje nije uspjelo:', err);
      return false;
    }
  }

  function showCopiedState(button) {
    const textEl = button.querySelector('.copy-btn__text');
    button.classList.add('is-copied');
    textEl.textContent = 'Copied!';
    setTimeout(() => {
      button.classList.remove('is-copied');
      textEl.textContent = 'Copy';
    }, 2000);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }
})();
