/**
 * ============================================================
 * MAP.JS — Bottle Map page
 * ============================================================
 */

const MapPage = (() => {
  const PIN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6v4l3 4v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-9l3-4V2z"/></svg>';

  function renderPins() {
  const pinLayer = document.getElementById("mapPins");

  if (!pinLayer) {
    return;
  }

  pinLayer.innerHTML = "";

  // โค้ดเดิมที่สร้าง pin ให้วางต่อจากตรงนี้
}

  function renderList() {
    const list = document.getElementById('mapPointList');
    list.innerHTML = CONFIG.COLLECTION_POINTS.map((p) => `
      <div class="action-item is-note">
        <span class="ico">${PIN_ICON}</span>
        ${p.name}
      </div>
    `).join('');
  }

  async function loadToday() {
    try {
      const daily = await Api.getDailyOverview();
      document.getElementById('mapTotal').textContent = `${(daily.todayWeightKg || 0).toFixed(2)} kg`;
    } catch (err) {
      Toast.error(`โหลดยอดวันนี้ไม่สำเร็จ: ${err.message}`);
    }
  }

  function init() {
    renderPins();
    renderList();
    loadToday();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', MapPage.init);
