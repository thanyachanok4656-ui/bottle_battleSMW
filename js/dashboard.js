/**
 * ============================================================
 * DASHBOARD.JS — Home page (KPIs, ranking teaser, quick links)
 * ============================================================
 */

const Dashboard = (() => {
  const REFRESH_MS = 60000;

  const QUICK_LINKS = [
    { href: 'journey.html', th: 'เส้นทางขวดใส', en: 'Bottle Journey', desc: '6 ขั้นตอนสู่โรงเรียนคาร์บอนต่ำ', icon: '<path d="M3 12h4l3-8 4 16 3-8h4"/>' },
    { href: 'ranking.html', th: 'อันดับห้องเรียน', en: 'Battle Ranking', desc: 'โพเดียมและตารางคะแนนเต็ม', icon: '<path d="M8 21h8M12 17v4M7 4h10l-1 8a4 4 0 0 1-8 0L7 4Z"/>' },
    { href: 'daily.html', th: 'ภาพรวมรายวัน', en: 'Daily Overview', desc: 'สถิติวันนี้และแนวโน้ม 7 วัน', icon: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>' },
    { href: 'carbon.html', th: 'วิเคราะห์คาร์บอน', en: 'Carbon Analytics', desc: 'กราฟลดคาร์บอนและเป้าหมาย', icon: '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/>' },
    { href: 'map.html', th: 'แผนที่จุดรับขวด', en: 'Bottle Map', desc: 'จุดรับขวดทั่วโรงเรียน', icon: '<path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>' },
    { href: 'gallery.html', th: 'คลังกิจกรรม', en: 'Gallery', desc: 'ภาพกิจกรรมล่าสุด', icon: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>' },
    { href: 'history.html', th: 'หลักฐานและรายงาน', en: 'Evidence & Report', desc: 'ค้นหา กรอง ส่งออกข้อมูล', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>' },
    { href: 'admin.html', th: 'ผู้ดูแลระบบ', en: 'Admin', desc: 'จัดการค่าตั้งต้นของระบบ', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9"/>' }
  ];

  function renderQuickLinks() {
    const grid = document.getElementById('quickLinkGrid');
    grid.innerHTML = QUICK_LINKS.map((item) => `
      <a href="${item.href}" class="glass-card quick-link-card reveal">
        <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">${item.icon}</svg></span>
        <h3>${item.th}</h3>
        <span class="en">${item.en}</span>
        <p>${item.desc}</p>
        <span class="go">ดูรายละเอียด <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </a>
    `).join('');
    initScrollReveal();
  }

  function setCounter(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.target = value;
    animateCounter(el);
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = CONFIG.COUNTER_ANIMATION_MS;
    const startValue = parseFloat((el.textContent || '0').replace(/[^0-9.-]/g, '')) || 0;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startValue + (target - startValue) * eased;
      el.textContent = value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderKpis(summary) {
    setCounter('kpiWeight', summary.totalWeightKg || 0);
    setCounter('kpiCo2', summary.totalCo2Kg || 0);
    setCounter('kpiTrees', summary.totalTrees || 0);
    setCounter('kpiParticipants', summary.totalParticipants || 0);
    document.getElementById('kpiBottles').textContent = `${(summary.totalBottles || 0).toLocaleString('th-TH')} ขวด`;
    document.getElementById('kpiCo2Tons').textContent = `${((summary.totalCo2Kg || 0) / 1000).toFixed(2)} ตัน CO₂e`;
    
  }

  function initials(classroom) {
    const match = classroom.match(/[A-Za-z]+|\d+/g) || [];
    return (match[0] || '').slice(0, 1).toUpperCase() + (match[1] || '').slice(0, 1);
  }

  function renderPodiumTeaser(ranking) {
    const el = document.getElementById('miniPodium');
    if (!ranking.length) {
      el.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);font-size:.82rem;">ยังไม่มีข้อมูล</p>';
      return;
    }
    const top3 = ranking.slice(0, 3);
    const medal = ['👑', '', ''];
    el.innerHTML = top3.map((r, i) => `
      <div class="slot p${i + 1}">
        <div class="avatar">${medal[i]}${initials(r.classroom)}</div>
        <div class="name">${r.classroom}</div>
        <div class="wt">${r.weightKg.toFixed(2)} kg</div>
        <div class="step"></div>
      </div>
    `).join('');
  }

  async function refresh() {
    try {
      const [summary, ranking] = await Promise.all([Api.getSummary(), Api.getRanking()]);
      renderKpis(summary || {});
      const sorted = (ranking || []).slice().sort((a, b) => a.rank - b.rank);
      renderPodiumTeaser(sorted);
    } catch (err) {
      Toast.error(`โหลดข้อมูลหน้าแรกไม่สำเร็จ: ${err.message}`);
    }
  }

  function init() {
    renderQuickLinks();
    refresh();
    setInterval(refresh, REFRESH_MS);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Dashboard.init);
