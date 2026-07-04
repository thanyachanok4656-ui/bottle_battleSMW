const HomeV2 = (() => {
  const TARGET_KG = 100;

  const stages = [
    {
      min: 0,
      max: 20,
      stage: 1,
      title: "จุดเริ่มต้นแห่งความหวัง",
      range: "0 - 20%",
      image: "images/world-stage-1.png"
    },
    {
      min: 20,
      max: 40,
      stage: 2,
      title: "โลกเริ่มมีชีวิต",
      range: "20 - 40%",
      image: "images/world-stage-2.png"
    },
    {
      min: 40,
      max: 60,
      stage: 3,
      title: "เกาะแห่งชีวิต",
      range: "40 - 60%",
      image: "images/world-stage-3.png"
    },
    {
      min: 60,
      max: 80,
      stage: 4,
      title: "เกาะแห่งชีวิตอุดมสมบูรณ์",
      range: "60 - 80%",
      image: "images/world-stage-4.png"
    },
    {
      min: 80,
      max: 100,
      stage: 5,
      title: "Guardian Tree",
      range: "80 - 100%",
      image: "images/world-stage-5.png"
    },
    {
      min: 100,
      max: Infinity,
      stage: 6,
      title: "World Tree of Bottle Battle",
      range: "100%+",
      image: "images/world-stage-6.png"
    }
  ];

  function getStage(percent) {
    return stages.find(s => percent >= s.min && percent < s.max) || stages[0];
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function render(summary) {
    const totalKg = Number(summary.totalWeightKg || 0);
    const targetKg = Number(summary.seasonTargetKg || TARGET_KG);
    const percent = targetKg > 0 ? Math.min((totalKg / targetKg) * 100, 120) : 0;
    const stage = getStage(percent);

    setText("worldStageBadge", `STAGE ${stage.stage}`);
    setText("worldStageTitle", stage.title);
    setText("worldStageRange", stage.range);
    setText("worldProgressText", `${percent.toFixed(1)}%`);
    setText("worldCurrentKg", totalKg.toFixed(1));
    setText("worldTargetKg", targetKg.toFixed(0));
    setText("worldTrees", summary.totalTrees || 0);

    const fill = document.getElementById("worldProgressFill");
    if (fill) fill.style.width = `${Math.min(percent, 100)}%`;

    const img = document.getElementById("worldStageImage");
    if (img) {
      img.style.opacity = "0";
      setTimeout(() => {
        img.src = stage.image;
        img.style.opacity = "1";
      }, 200);
    }
  }

  async function init() {
    try {
      const summary = await Api.getSummary();
      render(summary || {});
    } catch (err) {
      console.warn("Home V2 summary failed:", err.message);
      render({
        totalWeightKg: 33.5,
        seasonTargetKg: 100,
        totalTrees: 1
      });
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", HomeV2.init);
