/* ============================================================
   EDIT THIS LINE ONLY
   ------------------------------------------------------------
   Replace the text between the quotes below with your real URL.
   Keep the quotes and the semicolon exactly as they are.

   Example:
   const NEW_LINK = "https://example.com/latest-script";
   ============================================================ */
const NEW_LINK = "https://link-target.net/1239053/018ycTlqQkND";
/* ============================================================
   DO NOT EDIT BELOW THIS LINE
   ============================================================ */

function initScriptUpdatePage() {
  const btn = document.getElementById("openLinkBtn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    window.open(NEW_LINK, "_blank", "noopener,noreferrer");
  });
}

// Run immediately if the page is already ready, otherwise wait for it.
// This makes the script work correctly no matter how or when it's loaded.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScriptUpdatePage);
} else {
  initScriptUpdatePage();
}
