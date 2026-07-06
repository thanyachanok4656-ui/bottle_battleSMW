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
  /** Stage number + display name — matches the thresholds/names supplied for the campaign. */
  const STAGES = [
    { max: 20, name: 'เกาะเริ่มต้น' },
    { max: 40, name: 'เกาะแห่งชีวิต' },
    { max: 60, name: 'เกาะสีเขียว' },
    { max: 80, name: 'เกาะคาร์บอนต่ำ' },
    { max: 100, name: 'โลกสมบูรณ์' },
    { max: Infinity, name: 'เกาะแห่งชีวิตอุดมสมบูรณ์' }
  ];

  function stageForPercent(pct) {
    for (let i = 0; i < STAGES.length; i++) {
      if (pct <= STAGES[i].max) return i + 1;
    }
    return STAGES.length;
  }

  function showStatus(message) {
    const el = document.getElementById('worldStatus');
    if (!message) {
      el.style.display = 'none';
      return;
    }
    el.textContent = `⚠️ ${message}`;
    el.style.display = 'block';
  }

  function renderWorldHero(summary) {
    const currentKg = Number(summary.totalWeightKg) || 0;
    const targetKg = Number(summary.seasonTargetKg) || 0;

    if (targetKg <= 0) {
      showStatus('ยังไม่ได้ตั้งค่าเป้าหมาย (SEASON_TARGET_KG) ในแผ่น SETTINGS');
      return;
    }

    const rawPct = Math.max(0, (currentKg / targetKg) * 100);
    const stage = stageForPercent(rawPct);

    document.getElementById('worldStageImage').src = `images/world-stage-${stage}.png`;
    document.getElementById('worldStageNameText').textContent = STAGES[stage - 1].name;
    document.getElementById('worldCurrentKg').textContent = `เก็บได้แล้ว ${currentKg.toLocaleString('th-TH', { maximumFractionDigits: 1 })} kg`;
    document.getElementById('worldTargetKg').textContent = `เป้าหมาย ${targetKg.toLocaleString('th-TH', { maximumFractionDigits: 0 })} kg`;
    document.getElementById('worldProgressPct').textContent = `${rawPct.toFixed(1)}%`;

    const barPct = Math.min(rawPct, 100);
    requestAnimationFrame(() => {
      document.getElementById('worldProgressFill').style.width = `${barPct}%`;
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
      showStatus(`ไม่สามารถโหลดข้อมูลได้ในขณะนี้ (${err.message})`);
      showStatsError(`ไม่สามารถโหลดข้อมูลได้ในขณะนี้ (${err.message})`);
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', HomeWorldHero.init);
