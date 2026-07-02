/**
 * ============================================================
 * SIDEBAR.JS — Shared app sidebar (single source of truth)
 * Injected into every "app" page (dashboard, journey, ranking,
 * daily, carbon, map, gallery, innovation, history, admin,
 * submit) so the nav only has to be edited in one place.
 *
 * Usage: each page includes an empty
 *   <aside class="dash-sidebar" id="dashSidebar"></aside>
 * plus a <button id="sidebarToggle"> for mobile, then loads
 * this script. Sidebar.init() runs automatically on DOMContentLoaded.
 * ============================================================
 */

const Sidebar = (() => {
  const ICONS = {
    home: '<path d="M3 10 12 3l9 7"/><path d="M5 9v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9"/>',
    journey: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10l-1 8a4 4 0 0 1-8 0L7 4Z"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/>',
    pin: '<path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    gallery: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.6 1 2.5h6c0-.9.4-1.9 1-2.5A6 6 0 0 0 12 2Z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    bottle: '<path d="M9 2h6v4l3 4v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-9l3-4V2z"/>'
  };

  /** Every app page, in sidebar order. `file` must match the page's filename. */
  const NAV_ITEMS = [
    { file: 'dashboard.html', th: 'หน้าแรก', en: 'Home', icon: 'home' },
    { file: 'journey.html', th: 'เส้นทางขวดใส', en: 'Bottle Journey', icon: 'journey' },
    { file: 'ranking.html', th: 'อันดับห้องเรียน', en: 'Battle Ranking', icon: 'trophy' },
    { file: 'daily.html', th: 'ภาพรวมรายวัน', en: 'Daily Overview', icon: 'calendar' },
    { file: 'carbon.html', th: 'วิเคราะห์คาร์บอน', en: 'Carbon Analytics', icon: 'chart' },
    { file: 'map.html', th: 'แผนที่จุดรับขวด', en: 'Bottle Map', icon: 'pin' },
    { file: 'gallery.html', th: 'คลังกิจกรรม', en: 'Gallery', icon: 'gallery' },
    { file: 'innovation.html', th: 'นวัตกรรม', en: 'Innovation', icon: 'bulb' },
    { file: 'history.html', th: 'หลักฐานและรายงาน', en: 'Evidence & Report', icon: 'file' },
    { file: 'admin.html', th: 'ผู้ดูแลระบบ', en: 'Admin', icon: 'gear' }
  ];

  const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  function currentFile() {
    const path = window.location.pathname.split('/').pop();
    return path || 'dashboard.html';
  }

  function buildHtml() {
    const active = currentFile();
    const navHtml = NAV_ITEMS.map((item) => `
      <a href="${item.file}" class="${item.file === active ? 'is-active' : ''}">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS[item.icon]}</svg></span>
        <span class="nav-label"><span class="th">${item.th}</span><span class="en">${item.en}</span></span>
      </a>
    `).join('');

    return `
      <div class="dash-brand">
        <span class="dash-brand-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.bottle}</svg></span>
        <div class="dash-brand-text">
          <div class="th">Bottle Battle</div>
          <div class="en">to Carbon Goal</div>
        </div>
      </div>

      <a href="submit.html" class="dash-submit-cta ${active === 'submit.html' ? 'is-active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.plus}</svg>
        ส่งข้อมูลขวด · Submit
      </a>

      <nav class="dash-nav" aria-label="Dashboard sections">${navHtml}</nav>

      <div class="dash-sidebar-clock">
        <div class="date" id="sidebarDate">–</div>
        <div class="time" id="sidebarTime">--:--:--</div>
        <div class="weather"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg> อากาศแจ่มใส</div>
      </div>

      <a href="index.html" class="dash-back-link">← กลับหน้าเว็บหลัก</a>

      <div class="dash-ecopark">
        <span class="dash-ecopark-sign">ECO<br>PARK</span>
      </div>
    `;
  }

  function tickClock() {
    const now = new Date();
    const dateEl = document.getElementById('sidebarDate');
    const timeEl = document.getElementById('sidebarTime');
    if (dateEl) dateEl.textContent = `${now.getDate()} ${THAI_MONTHS[now.getMonth()]} ${now.getFullYear() + 543}`;
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Optional per-page hook, e.g. a "live" date label in a hero widget.
    const heroDateEl = document.getElementById('heroDateLabel');
    if (heroDateEl) heroDateEl.textContent = dateEl ? dateEl.textContent : '';
  }

  function initToggle() {
    const sidebar = document.getElementById('dashSidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', () => sidebar.classList.toggle('is-open'));
    sidebar.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => sidebar.classList.remove('is-open')));
  }

  function init() {
    const mount = document.getElementById('dashSidebar');
    if (!mount) return;
    mount.innerHTML = buildHtml();
    tickClock();
    setInterval(tickClock, 1000);
    initToggle();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Sidebar.init);
