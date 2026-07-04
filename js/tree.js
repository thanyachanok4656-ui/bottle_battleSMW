const TreeProgress = (() => {
  function getTreeStage(percent) {
    if (percent >= 100) return 6;
    if (percent >= 80) return 5;
    if (percent >= 60) return 4;
    if (percent >= 40) return 3;
    if (percent >= 20) return 2;
    return 1;
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
      showState('error');
      document.querySelector('#treeError p').textContent =
        'ยังไม่ได้ตั้งค่าเป้าหมาย SEASON_TARGET_KG ในชีต SETTINGS';
      return;
    }

    const pct = Math.max(0, Math.min(100, (currentKg / targetKg) * 100));
    const stage = getTreeStage(pct);

    document.getElementById('treeCurrentKg').textContent =
      currentKg.toLocaleString('th-TH', { maximumFractionDigits: 1 });

    document.getElementById('treeTargetKg').textContent =
      targetKg.toLocaleString('th-TH', { maximumFractionDigits: 0 });

    document.getElementById('treeProgressPct').textContent =
      `${pct.toFixed(1)}%`;

    const treeImg = document.getElementById('treeImage');
    if (treeImg) {
      treeImg.src = `images/tree/tree-stage${stage}.png`;
    }

    showState('content');

    requestAnimationFrame(() => {
      document.getElementById('treeProgressFill').style.width = `${pct}%`;
      setActiveStage(stage);
    });
  }

  async function init() {
    showState('loading');

    try {
      const summary = await Api.getSummary();

      if (!summary) {
        throw new Error('ไม่ได้รับข้อมูลสรุปจากเซิร์ฟเวอร์');
      }

      render(summary);
    } catch (err) {
      showState('error');
      const errEl = document.querySelector('#treeError p');
      if (errEl) {
        errEl.textContent = `⚠️ ไม่สามารถโหลดข้อมูลต้นไม้ได้ (${err.message})`;
      }
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', TreeProgress.init);
