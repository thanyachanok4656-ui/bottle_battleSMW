const HomeV2 = (() => {
  const FALLBACK_TARGET = 100;

  const STAGES = [
    {
      stage: 1,
      min: 0,
      max: 20,
      title: "จุดเริ่มต้นแห่งความหวัง",
      range: "0 - 20%",
      image: "images/world-stage-1.png"
    },
    {
      stage: 2,
      min: 20,
      max: 40,
      title: "โลกเริ่มมีชีวิต",
      range: "20 - 40%",
      image: "images/world-stage-2.png"
    },
    {
      stage: 3,
      min: 40,
      max: 60,
      title: "เกาะแห่งชีวิต",
      range: "40 - 60%",
      image: "images/world-stage-3.png"
    },
    {
      stage: 4,
      min: 60,
      max: 80,
      title: "เกาะแห่งชีวิตอุดมสมบูรณ์",
      range: "60 - 80%",
      image: "images/world-stage-4.png"
    },
    {
      stage: 5,
      min: 80,
      max: 100,
      title: "Guardian Tree",
      range: "80 - 100%",
      image: "images/world-stage-5.png"
    },
    {
      stage: 6,
      min: 100,
      max: Infinity,
      title: "World Tree of Bottle Battle",
      range: "100%+",
      image: "images/world-stage-6.png"
    }
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function getStage(percent) {
    return STAGES.find(s => percent >= s.min && percent < s.max) || STAGES[0];
  }

  function render(summary) {
    const totalKg = Number(summary.totalWeightKg || 0);
    const targetKg = Number(summary.seasonTargetKg || FALLBACK_TARGET);
    const percent = targetKg > 0 ? (totalKg / targetKg) * 100 : 0;
    const safePercent = Math.min(percent, 120);
    const stage = getStage(safePercent);

    setText("worldStageBadge", `STAGE ${stage.stage}`);
    setText("worldStageTitle", stage.title);
    setText("worldStageRange", stage.range);
    setText("worldProgressText", `${safePercent.toFixed(1)}%`);
    setText("worldCurrentKg", totalKg.toFixed(1));
    setText("worldTargetKg", targetKg.toFixed(0));
    setText("worldTrees", summary.totalTrees || 0);

    const fill = $("worldProgressFill");
    if (fill) fill.style.width = `${Math.min(safePercent, 100)}%`;

    const img = $("worldStageImage");
    if (img) {
      img.style.opacity = "0";
      img.style.transform = "scale(.98)";
      setTimeout(() => {
        img.src = stage.image;
        img.onload = () => {
          img.style.opacity = "1";
          img.style.transform = "scale(1)";
        };
      }, 180);
    }
  }

  async function init() {
    try {
      const summary = await Api.getSummary();
      render(summary || {});
    } catch (err) {
      console.warn("Home V2 fallback:", err.message);
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
