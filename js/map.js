/**
 * ============================================================
 * MAP.JS — Bottle Map page
 * ============================================================
 */

const MapPage = (() => {
  const PIN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6v4l3 4v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-9l3-4V2z"/></svg>';

  function renderPins() {
    const pinLayer = document.getElementById("mapPins");
    if (!pinLayer) return;

    pinLayer.innerHTML = "";

    if (!CONFIG.COLLECTION_POINTS) return;

    pinLayer.innerHTML = CONFIG.COLLECTION_POINTS.map((p) => `
      <button
        class="map-pin"
        style="left:${p.x || 50}%; top:${p.y || 50}%"
        type="button"
        title="${p.name || ''}">
        ${PIN_ICON}
      </button>
    `).join("");
  }

  function renderList() {
    const list = document.getElementById("mapPointList");
    if (!list) return;

    if (!CONFIG.COLLECTION_POINTS) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = CONFIG.COLLECTION_POINTS.map((p) => `
      <div class="action-item is-note">
        <span class="ico">${PIN_ICON}</span>
        ${p.name || "Collection Point"}
      </div>
    `).join("");
  }

  async function loadToday() {
    const total = document.getElementById("mapTotal");
    if (!total) return;

    try {
      const daily = await Api.getDailyOverview();
      total.textContent = `${(daily.todayWeightKg || 0).toFixed(2)} kg`;
    } catch (err) {
      console.error("Map daily error:", err);
    }
  }

  function init() {
    renderPins();
    renderList();
    loadToday();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", MapPage.init);
