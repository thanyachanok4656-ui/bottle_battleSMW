/**
 * ============================================================
 * HOME.JS — "เกาะแห่งชีวิต" World Hero + KPI stats (index.html)
 * ------------------------------------------------------------
 * Drives the world-stage image/caption/progress bar and the four
 * stat cards below it, all from the live getSummary() API. No
 * fake data: shows a loading state while fetching, and an
 * explicit error state (not a fabricated 0%) if the backend is
 * unreachable or no season target is configured.
 * ============================================================ */

const HomeWorldHero = (() => {
  /** Five growth stages — edit copy/thresholds here to match your campaign. */
  const STAGES = [
    { max: 20, name: 'เกาะเริ่มก่อตัว', range: '0 - 20%' },
    { max: 40, name: 'โลกเริ่มมีชีวิต', range: '20 - 40%' },
    { max: 60, name: 'ป่าเริ่มเขียวชอุ่ม', range: '40 - 60%' },
    { max: 80, name: 'เกาะแห่งความอุดมสมบูรณ์', range: '60 - 80%' },
    { max: 100, name: 'เกาะแห่งชีวิตสมบูรณ์แบบ', range: '80 - 100%' }
  ];

  function stageForPercent(pct) {
    for (let i = 0; i < STAGES.length; i++) {
      if (pct <= STAGES[i].max) return i + 1;
    }
    return STAGES.length;
  }

  function renderWorldHero(summary) {
    const currentKg = Number(summary.totalWeightKg) || 0;
    const targetKg = Number(summary.seasonTargetKg) || 0;

    if (targetKg <= 0) {
      document.getElementById('worldStageName').textContent = 'ยังไม่ได้ตั้งค่าเป้าหมาย';
      document.getElementById('worldStageRange').textContent = 'ตรวจสอบ SEASON_TARGET_KG ในแผ่น SETTINGS';
      return;
    }

    const pct = Math.max(0, Math.min(100, (currentKg / targetKg) * 100));
    const stage = stageForPercent(pct);
    const info = STAGES[stage - 1];

    document.getElementById('worldStageTag').textContent = `STAGE ${stage}`;
    document.getElementById('worldStageImage').src = `images/world-stage-${stage}.png`;
    document.getElementById('worldStageName').textContent = info.name;
    document.getElementById('worldStageRange').textContent = info.range;
    document.getElementById('worldCurrentKg').textContent = `เก็บได้แล้ว ${currentKg.toLocaleString('th-TH', { maximumFractionDigits: 1 })} kg`;
    document.getElementById('worldTargetKg').textContent = `เป้าหมาย ${targetKg.toLocaleString('th-TH', { maximumFractionDigits: 0 })} kg`;
    document.getElementById('worldProgressPct').textContent = `${pct.toFixed(1)}%`;

    requestAnimationFrame(() => {
      document.getElementById('worldProgressFill').style.width = `${pct}%`;
    });
  }

  function renderStats(summary) {
    document.getElementById('statWeight').textContent = (Number(summary.totalWeightKg) || 0).toLocaleString('th-TH', { maximumFractionDigits: 1 });
    document.getElementById('statCo2').textContent = (Number(summary.totalCo2Kg) || 0).toLocaleString('th-TH', { maximumFractionDigits: 1 });
    document.getElementById('statTrees').textContent = (Number(summary.totalTrees) || 0).toLocaleString('th-TH');
    document.getElementById('statClassrooms').textContent = (Number(summary.activeClassrooms) || 0).toLocaleString('th-TH');
  }

  function showStatsError(message) {
    const errEl = document.getElementById('worldStatsError');
    errEl.textContent = `⚠️ ${message}`;
    errEl.style.display = 'block';
    ['statWeight', 'statCo2', 'statTrees', 'statClassrooms'].forEach((id) => {
      document.getElementById(id).textContent = '–';
    });
  }

  async function init() {
    try {
      const summary = await Api.getSummary();
      if (!summary) throw new Error('ไม่ได้รับข้อมูลสรุปจากเซิร์ฟเวอร์');
      renderWorldHero(summary);
      renderStats(summary);
    } catch (err) {
      document.getElementById('worldStageName').textContent = 'โหลดข้อมูลไม่สำเร็จ';
      document.getElementById('worldStageRange').textContent = '–';
      showStatsError(`ไม่สามารถโหลดข้อมูลได้ในขณะนี้ (${err.message})`);
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', HomeWorldHero.init);
