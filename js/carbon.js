/**
 * ============================================================
 * CARBON.JS — Carbon Analytics page
 * ============================================================
 */

const CarbonPage = (() => {
  let chart = null;
  let range = 'monthly';

  function renderChart(trend) {
    const ctx = document.getElementById('carbonChart');
    if (!isChartJsReady()) {
      renderChartUnavailable(ctx);
      return;
    }
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trend.labels,
        datasets: [{ data: trend.values, backgroundColor: '#12b76a', borderRadius: 6, maxBarThickness: 30 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(128,128,128,0.12)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function renderGoal(summary) {
    const targetCo2 = (summary.seasonTargetKg || 0) * CONFIG.CO2_PER_KG_PET;
    const pct = targetCo2 > 0 ? Math.min(100, (summary.totalCo2Kg / targetCo2) * 100) : 0;
    const circumference = 2 * Math.PI * 16;
    document.getElementById('carbonGoalArc').setAttribute('stroke-dasharray', `${(pct / 100) * circumference} ${circumference}`);
    document.getElementById('carbonGoalPct').textContent = `${pct.toFixed(0)}%`;
    document.getElementById('carbonGoalLabel').textContent = `${(summary.totalCo2Kg || 0).toFixed(0)} / ${targetCo2.toFixed(0)} kgCO₂e`;
    document.getElementById('co2FactorLabel').textContent = CONFIG.CO2_PER_KG_PET;
  }

  function renderInsight(trend) {
    const values = trend.values || [];
    const el = document.getElementById('carbonInsightText');
    if (values.length < 2) {
      el.textContent = 'ยังไม่มีข้อมูลเพียงพอสำหรับวิเคราะห์แนวโน้ม';
      return;
    }
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    if (prev === 0) {
      el.textContent = `ช่วงล่าสุดเก็บได้ ${last.toFixed(1)} kg — ยังไม่มีข้อมูลช่วงก่อนหน้าเพื่อเปรียบเทียบ`;
      return;
    }
    const changePct = ((last - prev) / prev) * 100;
    const direction = changePct >= 0 ? 'เพิ่มขึ้น' : 'ลดลง';
    el.textContent = `ยอดเก็บขวดช่วงล่าสุด${direction} ${Math.abs(changePct).toFixed(1)}% เทียบกับช่วงก่อนหน้า`;
  }

  function renderBreakdown(carbon) {
    const tbody = document.getElementById('carbonBreakdownBody');
    const rows = (carbon.byClassroom || []);
    tbody.innerHTML = rows.length
      ? rows.map((r) => `<tr><td class="cell-classroom">${r.classroom}</td><td>${r.weightKg.toFixed(2)}</td><td>${r.co2Kg.toFixed(2)}</td></tr>`).join('')
      : '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);">ยังไม่มีข้อมูล</td></tr>';
  }

  async function loadRange() {
    try {
      const stats = await Api.getStatistics(range);
      renderChart(stats.trend || { labels: [], values: [] });
      renderInsight(stats.trend || {});
    } catch (err) {
      Toast.error(`โหลดกราฟไม่สำเร็จ: ${err.message}`);
    }
  }

  function initTabs() {
    document.querySelectorAll('.carbon-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.carbon-tab').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        range = tab.dataset.range;
        loadRange();
      });
    });
  }

  async function init() {
    initTabs();
    try {
      const [summary, carbon] = await Promise.all([Api.getSummary(), Api.getCarbonReduction()]);
      renderGoal(summary || {});
      renderBreakdown(carbon || {});
    } catch (err) {
      Toast.error(`โหลดข้อมูลคาร์บอนไม่สำเร็จ: ${err.message}`);
    }
    loadRange();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', CarbonPage.init);
