/**
 * ============================================================
 * DASHBOARD.JS — Home page (KPIs, ranking teaser, quick links)
 * ============================================================
 */

const Dashboard = (() => {
  const REFRESH_MS = 60000;

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
    const pct = CONFIG.TOTAL_STUDENTS > 0 ? ((summary.totalParticipants || 0) / CONFIG.TOTAL_STUDENTS) * 100 : 0;
    document.getElementById('kpiParticipantsPct').textContent = `${pct.toFixed(2)}% จากทั้งหมด`;
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
    refresh();
    setInterval(refresh, REFRESH_MS);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Dashboard.init);
