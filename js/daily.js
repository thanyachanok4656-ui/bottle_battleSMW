/**
 * ============================================================
 * DAILY.JS — Daily Overview page
 * ============================================================
 */

const DailyPage = (() => {
  const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const THAI_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  let chart = null;

  function formatThaiDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  function render(daily) {
    document.getElementById('dailyDateLabel').textContent = formatThaiDate(daily.date);
    document.getElementById('dailyWeight').textContent = (daily.todayWeightKg || 0).toFixed(2);
    document.getElementById('dailyCo2').textContent = (daily.todayCo2Kg || 0).toFixed(2);
    document.getElementById('dailyTrees').textContent = daily.todayTrees || 0;
    document.getElementById('dailyBest').textContent = daily.bestClassroom
      ? `${daily.bestClassroom} · ${daily.bestClassroomWeightKg.toFixed(2)} kg` : 'ยังไม่มีข้อมูล';
    document.getElementById('dailyWorst').textContent = daily.worstClassroom
      ? `${daily.worstClassroom} · ${daily.worstClassroomWeightKg.toFixed(2)} kg` : 'ยังไม่มีข้อมูล';
    document.getElementById('cumulativeWeight').textContent = `${(daily.cumulativeWeightKg || 0).toFixed(1)} kg`;
    document.getElementById('cumulativeCo2').textContent = `${(daily.cumulativeCo2Kg || 0).toFixed(1)} kgCO₂e`;
    document.getElementById('cumulativeBottles').textContent = `${(daily.cumulativeBottles || 0).toLocaleString('th-TH')} ขวด`;

    const labels = (daily.trend && daily.trend.labels) || [];
    const values = (daily.trend && daily.trend.values) || [];

    const tbody = document.getElementById('dailyTableBody');
    tbody.innerHTML = labels.length
      ? labels.map((iso, i) => `<tr><td>${formatThaiDate(iso)}</td><td>${values[i].toFixed(2)} kg</td></tr>`).reverse().join('')
      : '<tr><td colspan="2" style="text-align:center;color:var(--text-muted);">ยังไม่มีข้อมูล</td></tr>';

    const shortLabels = labels.map((iso) => {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : `${d.getDate()} ${THAI_DAYS[d.getDay()]}`;
    });

    const ctx = document.getElementById('dailyChart');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: shortLabels,
        datasets: [{
          label: 'kg',
          data: values,
          borderColor: '#0ba5ec',
          backgroundColor: 'rgba(11,165,236,0.12)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          borderWidth: 2.5
        }]
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

  async function init() {
    try {
      const daily = await Api.getDailyOverview();
      render(daily || {});
    } catch (err) {
      Toast.error(`โหลดข้อมูลภาพรวมรายวันไม่สำเร็จ: ${err.message}`);
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', DailyPage.init);
