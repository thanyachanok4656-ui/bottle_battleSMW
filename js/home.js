document.addEventListener("DOMContentLoaded", async () => {
  try {
    const summary = await Api.getSummary();

    const totalKg = Number(summary.totalWeightKg || 0);
    const targetKg = Number(summary.seasonTargetKg || 100);
    const percent = targetKg > 0 ? Math.min((totalKg / targetKg) * 100, 100) : 0;

    const currentEl = document.getElementById("worldCurrentKg");
    const targetEl = document.getElementById("worldTargetKg");
    const pctEl = document.getElementById("worldProgressPct");
    const fillEl = document.getElementById("worldProgressFill");
    const imageEl = document.getElementById("worldStageImage");
    const nameEl = document.getElementById("worldStageName");

    if (currentEl) currentEl.textContent = `${totalKg.toFixed(1)} kg`;
    if (targetEl) targetEl.textContent = `${targetKg.toFixed(0)} kg`;
    if (pctEl) pctEl.textContent = `${percent.toFixed(1)}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;

    let stage = 1;
    let stageName = "เกาะเริ่มต้น";

    if (percent >= 20) {
      stage = 2;
      stageName = "เกาะแห่งชีวิต";
    }

    if (percent >= 40) {
      stage = 3;
      stageName = "เกาะสีเขียว";
    }

    if (percent >= 60) {
      stage = 4;
      stageName = "เกาะคาร์บอนต่ำ";
    }

    if (percent >= 80) {
      stage = 5;
      stageName = "โลกสมบูรณ์";
    }
function updateHomeStage(totalWeightKg) {
  const targetKg = 100;
  const percent = Math.min((totalWeightKg / targetKg) * 100, 100);

  let stage = 1;
  let title = "โลกเริ่มต้น";

  if (percent >= 20 && percent < 40) {
    stage = 2;
    title = "โลกเริ่มมีชีวิต";
  } else if (percent >= 40 && percent < 60) {
    stage = 3;
    title = "ธรรมชาติกำลังฟื้นตัว";
  } else if (percent >= 60 && percent < 80) {
    stage = 4;
    title = "โลกกลับมาเขียวขจี";
  } else if (percent >= 80) {
    stage = 5;
    title = "เกาะแห่งชีวิต";
  }

  document.getElementById("heroStage").textContent = `STAGE ${stage}`;
  document.getElementById("heroTitle").textContent = title;
  document.getElementById("heroPercent").textContent = `${percent.toFixed(1)}%`;
  document.getElementById("heroStageImage").src = `images/tree-stage-${stage}.png`;
}
    if (imageEl) imageEl.src = `images/world-stage-${stage}.png`;
    if (nameEl) nameEl.textContent = stageName;

  } catch (err) {
    console.error("Home summary error:", err);
  }
});
