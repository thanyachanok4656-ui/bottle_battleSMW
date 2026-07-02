/**
 * ============================================================
 * GALLERY.JS — Gallery page (config-driven placeholders)
 * ============================================================
 */

const GalleryPage = (() => {
  function render() {
    const grid = document.getElementById('galleryGridFull');
    grid.innerHTML = CONFIG.GALLERY_ITEMS.map((item) => `
      <div class="gallery-tile reveal" title="${item.caption}" style="aspect-ratio:4/3;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
        <span class="cap">${item.caption}</span>
        <span class="date">${item.dateLabel}</span>
      </div>
    `).join('');
    initScrollReveal();
  }

  return { init: render };
})();

document.addEventListener('DOMContentLoaded', GalleryPage.init);
