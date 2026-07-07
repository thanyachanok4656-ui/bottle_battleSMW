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
  /** Stage number thresholds — the display name for each stage is illustrated
      directly inside each world-stage-N.png artwork (and previously shown in
      the H1; the H1 is now a static "Bottle Battle to Carbon Goal" title).
      1: เกาะเริ่มต้น · 2: เกาะแห่งชีวิต · 3: เกาะสีเขียว ·
      4: เกาะคาร์บอนต่ำ · 5: โลกสมบูรณ์ · 6: เกาะแห่งชีวิตอุดมสมบูรณ์ (>100%) */
  const STAGE_MAX = [20, 40, 60, 80, 100, Infinity];

  function stageForPercent(pct) {
    for (let i = 0; i < STAGE_MAX.length; i++) {
      if (pct <= STAGE_MAX[i]) return i + 1;
    }
    return STAGE_MAX.length;
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
    document.getElementById('worldCurrentKg').textContent = `${currentKg.toLocaleString('th-TH', { maximumFractionDigits: 1 })} kg`;
    document.getElementById('worldTargetKg').textContent = `${targetKg.toLocaleString('th-TH', { maximumFractionDigits: 0 })} kg`;
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
