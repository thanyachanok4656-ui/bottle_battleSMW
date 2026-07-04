/**
 * ============================================================
 * TREE.JS — Growing Tree Progress (home page)
 * Grows a 5-stage tree based on totalWeightKg / seasonTargetKg
 * from the live getSummary API. No fake data: shows a loading
 * skeleton while fetching, and an explicit error state if the
 * backend is unreachable — never a fabricated percentage.
 * ============================================================ */
const TreeProgress = (() => {
  /** Map a 0–100 percentage to one of the 5 named growth stages. */
 function getTreeStage(percent) {
  if (percent >= 100) return 6;
  if (percent >= 80) return 5;
  if (percent >= 60) return 4;
  if (percent >= 40) return 3;
  if (percent >= 20) return 2;
  return 1;
}

function updateTree(totalWeightKg, targetKg) {
  const percent = targetKg > 0
    ? Math.min((totalWeightKg / targetKg) * 100, 100)
    : 0;

  const stage = getTreeStage(percent);

  const treeImg = document.querySelector("#growingTree");
  if (treeImg) {
    treeImg.src = `images/tree-stage-${stage}.png`;
  }

  const percentText = document.querySelector("#treePercent");
  if (percentText) {
    percentText.textContent = `${Math.round(percent)}%`;
  }
}
  

  function showState(state) {
    document.getElementById('treeLoading').style.display = state === 'loading' ? 'block' : 'none';
    document.getElementById('treeError').style.display = state === 'error' ? 'block' : 'none';
    document.getElementById('treeContent').style.display = state === 'content' ? 'block' : 'none';
  }

  function setActiveStage(stage) {
    document.querySelectorAll('.tree-stage').forEach((el) => {
      el.classList.toggle('is-active', parseInt(el.dataset.stage, 10) === stage);
    });
  }

  function render(summary) {
    const currentKg = Number(summary.totalWeightKg) || 0;
    const targetKg = Number(summary.seasonTargetKg) || 0;

    if (targetKg <= 0) {
      // No valid target configured in SETTINGS — this is a data problem, not
      // something we should paper over with a made-up number.
      showState('error');
      document.querySelector('#treeError p').textContent =
        'ยังไม่ได้ตั้งค่าเป้าหมาย (SEASON_TARGET_KG) ในแผ่น SETTINGS';
      return;
    }

    const pct = Math.max(0, Math.min(100, (currentKg / targetKg) * 100));
    const stage = stageForPercent(pct);

    document.getElementById('treeCurrentKg').textContent = currentKg.toLocaleString('th-TH', { maximumFractionDigits: 1 });
    document.getElementById('treeTargetKg').textContent = targetKg.toLocaleString('th-TH', { maximumFractionDigits: 0 });
    document.getElementById('treeProgressPct').textContent = `${pct.toFixed(1)}%`;

    showState('content');

    // Animate the fill and the tree stage together once the section is visible.
    requestAnimationFrame(() => {
      document.getElementById('treeProgressFill').style.width = `${pct}%`;
      setActiveStage(stage);
    });
  }

  async function init() {
    showState('loading');
    try {
      const summary = await Api.getSummary();
      if (!summary) throw new Error('ไม่ได้รับข้อมูลสรุปจากเซิร์ฟเวอร์');
      render(summary);
    } catch (err) {
      showState('error');
      const errEl = document.querySelector('#treeError p');
      if (errEl) errEl.textContent = `⚠️ ไม่สามารถโหลดข้อมูลต้นไม้ได้ในขณะนี้ (${err.message})`;
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', TreeProgress.init);
