/* Full-screen overlay: explicit links (a.js-lightbox-trigger) OR content images in the doc body */
(() => {
  function closeOverlay(overlay, onKey) {
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    document.body.style.overflow = "";
  }

  function openLightbox(href, alt) {
    const overlay = document.createElement("div");
    overlay.className = "image-lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Enlarged image");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "image-lightbox-close";
    btn.setAttribute("aria-label", "Close");
    btn.innerHTML = "\u00d7";

    const img = document.createElement("img");
    img.src = href;
    img.alt = alt || "";
    img.className = "image-lightbox-img";
    img.decoding = "async";

    overlay.appendChild(btn);
    overlay.appendChild(img);
    document.body.style.overflow = "hidden";

    function onKey(e) {
      if (e.key === "Escape") closeOverlay(overlay, onKey);
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target === btn) closeOverlay(overlay, onKey);
    });
    img.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    btn.focus();
  }

  /** Images in header, nav, search, sidebars — not doc figures */
  function isChromeImage(img) {
    return !!(
      img.closest(".md-header") ||
      img.closest(".md-tabs") ||
      img.closest(".md-sidebar") ||
      img.closest(".md-nav") ||
      img.closest(".md-footer") ||
      img.closest(".md-search") ||
      img.closest(".md-dialog") ||
      img.closest(".md-overlay")
    );
  }

  /**
   * Primary article content (Material + Zensical classic/modern).
   * Zensical "modern" may omit article.md-typeset, so we accept several wrappers.
   */
  function isDocBodyImage(img) {
    if (isChromeImage(img)) return false;
    if (img.closest("a.js-lightbox-trigger")) return false;
    if (img.hasAttribute("data-no-lightbox")) return false;

    return !!(
      img.closest("article.md-typeset") ||
      img.closest(".md-content__inner.md-typeset") ||
      img.closest(".md-content__inner") ||
      img.closest(".md-content") ||
      img.closest('[role="main"]') ||
      (img.closest("main") && !img.closest(".md-sidebar"))
    );
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a.js-lightbox-trigger");
    if (link && link.getAttribute("href")) {
      e.preventDefault();
      const inner = link.querySelector("img");
      const alt = inner ? inner.getAttribute("alt") || "" : "";
      openLightbox(link.getAttribute("href"), alt);
      return;
    }

    const img =
      e.target.closest("picture img") ||
      e.target.closest("img");
    if (!img || !isDocBodyImage(img)) return;

    const src = img.currentSrc || img.src;
    if (!src || src.startsWith("data:")) return;
    if (src.includes("twemoji") || src.includes("/emoji/")) return;

    const w = img.naturalWidth || img.width || 0;
    if (w > 0 && w < 32) return;

    e.preventDefault();
    openLightbox(src, img.getAttribute("alt") || "");
  });
})();
