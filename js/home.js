const HomeWorldHero = (() => {
  const STAGE_MAX = [20, 40, 60, 80, 100, Infinity];

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const item = el(id);
    if (item) item.textContent = text;
  }

  function stageForPercent(pct) {
    for (let i = 0; i < STAGE_MAX.length; i++) {
      if (pct <= STAGE_MAX[i]) return i + 1;
    }
    return 6;
  }

  function showStatus(message) {
    const item = el('worldStatus');
    if (!item) return;

    if (!message) {
      item.style.display = 'none';
      return;
    }

    item.textContent = `⚠️ ${message}`;
    item.style.display = 'block';
  }

  function renderWorldHero(summary) {
    const currentKg = Number(summary.totalWeightKg) || 0;
    const targetKg = Number(summary.seasonTargetKg) || 0;

    if (targetKg <= 0) {
      showStatus('ยังไม่ได้ตั้งค่าเป้าหมาย SEASON_TARGET_KG');
      return;
    }

    const rawPct = Math.max(0, (currentKg / targetKg) * 100);
    const stage = stageForPercent(rawPct);
    const barPct = Math.min(rawPct, 100);

    const image = el('worldStageImage');
    if (image) image.src = `images/world-stage-${stage}.png`;

    setText('worldCurrentKg', `${currentKg.toLocaleString('th-TH', { maximumFractionDigits: 1 })} kg`);
    setText('worldTargetKg', `${targetKg.toLocaleString('th-TH', { maximumFractionDigits: 0 })} kg`);
    setText('worldProgressPct', `${rawPct.toFixed(1)}%`);

    const fill = el('worldProgressFill');
    if (fill) fill.style.width = `${barPct}%`;
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
