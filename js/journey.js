/**
 * ============================================================
 * JOURNEY.JS — Bottle Journey page (config-driven, static content)
 * ============================================================
 */

const JourneyPage = (() => {
  const ICONS = {
    bottle: '<path d="M9 2h6v4l3 4v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-9l3-4V2z"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10l-1 8a4 4 0 0 1-8 0L7 4Z"/>',
    bank: '<path d="M3 21h18M4 21V10l8-6 8 6v11M9 21v-6h6v6"/>',
    data: '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.6 1 2.5h6c0-.9.4-1.9 1-2.5A6 6 0 0 0 12 2Z"/>',
    tree: '<path d="M12 22v-7"/><path d="M12 15 6 9l6-7 6 7-6 6Z"/>'
  };

  const DETAILS = [
    'นักเรียนและครูร่วมกันตั้งจุดรับขวดในทุกอาคารเรียน พร้อมป้ายรณรงค์ให้ความรู้เรื่องการคัดแยก',
    'จัดการแข่งขันระหว่างห้องเรียน สร้างแรงจูงใจด้วยคะแนนสะสมและของรางวัลรายเดือน',
    'ขวดที่คัดแยกแล้วถูกชั่งน้ำหนักและบันทึกเข้าสู่ระบบผ่านหน้า Submit ทุกครั้งที่มีการส่งขวด',
    'ระบบคำนวณปริมาณคาร์บอนที่ลดได้โดยอัตโนมัติ และแสดงผลผ่านแดชบอร์ดแบบเรียลไทม์',
    'ต่อยอดขวดที่เก็บได้สู่โครงงานนวัตกรรมของนักเรียน เช่น สิ่งประดิษฐ์จากขวดพลาสติก',
    'ปลูกฝังให้การลดขยะและลดคาร์บอนกลายเป็นส่วนหนึ่งของวัฒนธรรมโรงเรียนอย่างยั่งยืน'
  ];

  function renderTrack() {
    const track = document.getElementById('journeyTrack');
    track.innerHTML = CONFIG.JOURNEY_STEPS.map((step, i) => `
      <div class="journey-step">
        <span class="num"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS[step.icon] || ''}</svg></span>
        <span class="th">${step.th}</span>
        <span class="sub">${step.sub}</span>
      </div>
    `).join('');
  }

  function renderDetailCards() {
    const grid = document.getElementById('journeyDetailGrid');
    grid.className = 'widgets-row cols-3-even';
    grid.innerHTML = CONFIG.JOURNEY_STEPS.map((step, i) => `
      <div class="glass-card widget-panel reveal">
        <div class="widget-title">
          <span class="widget-title-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">${ICONS[step.icon] || ''}</svg></span>
          ${i + 1}. ${step.th}
        </div>
        <p style="font-size:0.85rem;color:var(--text-secondary);">${DETAILS[i] || step.sub}</p>
      </div>
    `).join('');
  }

  function init() {
    renderTrack();
    renderDetailCards();
    initScrollReveal();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', JourneyPage.init);
