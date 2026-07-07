/**
 * ============================================================
 * HOME.JS — "เกาะแห่งชีวิต" World Hero (index.html)
 * ------------------------------------------------------------
 * Picks which world-stage-N.png to show based on
 * totalWeightKg / seasonTargetKg from the live getSummary() API.
 * No fake data: shows an explicit error message (not a fabricated
 * stage) if the backend is unreachable or no season target is
 * configured.
 * ============================================================ */

const HomeWorldHero = (() => {
  /** Stage number thresholds — the display name for each stage is illustrated
      directly inside each world-stage-N.png artwork.
      1: เกาะเริ่มต้น · 2: เกาะแห่งชีวิต · 3: เกาะสีเขียว ·
      4: เกาะคาร์บอนต่ำ · 5: โลกสมบูรณ์ · 6: เกาะแห่งชีวิตอุดมสมบูรณ์ (>100%) */
  const STAGE_MAX = [20, 40, 60, 80, 100, Infinity];

  function stageForPercent(pct) {
    for (let i = 0; i < STAGE_MAX.length; i++) {
      if (pct <= STAGE_MAX[i]) return i + 1;
    }
    return STAGE_MAX.length;
  }

  /** Safely set an element's image src; no-ops if the element doesn't exist. */
  function setSrc(id, value) {
    const el = document.getElementById(id);
    if (el) el.src = value;
  }

  /** Safely set an element's text content; no-ops if the element doesn't exist. */
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /** Safely set an element's style property; no-ops if the element doesn't exist. */
  function setStyle(id, prop, value) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = value;
  }

  function showStatus(message) {
    const el = document.getElementById('worldStatus');
    if (!el) return;
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

    setSrc('worldStageImage', `images/world-stage-${stage}.png`);
    setText('worldProgressPct', `${rawPct.toFixed(1)}%`);
    setText('worldCurrentKg', `${currentKg.toLocaleString('th-TH', { maximumFractionDigits: 1 })} kg`);
    setText('worldTargetKg', `${targetKg.toLocaleString('th-TH', { maximumFractionDigits: 0 })} kg`);

    const barPct = Math.min(rawPct, 100);
    requestAnimationFrame(() => setStyle('worldProgressFill', 'width', `${barPct}%`));
  }

  async function init() {
    try {
      const summary = await Api.getSummary();
      if (!summary) throw new Error('ไม่ได้รับข้อมูลสรุปจากเซิร์ฟเวอร์');
      renderWorldHero(summary);
    } catch (err) {
      showStatus(`ไม่สามารถโหลดข้อมูลได้ในขณะนี้ (${err.message})`);
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', HomeWorldHero.init);
