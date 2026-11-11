/* ==========================================================
   UPDATE STRANICA — ne mijenjaj ovaj fajl.
   Tekstovi i link dolaze iz config.js (Script Update Editor).
   ========================================================== */
(function () {
  var u = (window.SITE_CONFIG && window.SITE_CONFIG.update) || {};
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var safeLink = /^https?:\/\//i.test(u.link || '') ? u.link : '#';

  document.title = u.pageTitle || u.title || 'Script Updated';

  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="bg-glow bg-glow--one" aria-hidden="true"></div>' +
    '<div class="bg-glow bg-glow--two" aria-hidden="true"></div>' +
    '<div class="bg-grid" aria-hidden="true"></div>' +
    '<main class="card">' +
      (u.pill ? '<div class="status-pill"><span class="status-dot"></span><span>' + esc(u.pill) + '</span></div>' : '') +
      '<h1 class="title">' + esc(u.title) + '</h1>' +
      (u.text ? '<p class="subtitle">' + esc(u.text).replace(/\n/g, '<br>') + '</p>' : '') +
      '<a id="openLinkBtn" class="cta-button" href="' + esc(safeLink) + '" target="_blank" rel="noopener noreferrer">' +
        '<span>' + esc(u.button || 'Open New Link') + '</span>' +
        '<svg class="cta-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</a>' +
      (u.footnote ? '<p class="footnote">' + esc(u.footnote) + '</p>' : '') +
    '</main>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
})();
