const HomeV3 = (() => {
  const FALLBACK_TARGET_KG = 100;

  const STAGES = [
    {
      stage: 1,
      min: 0,
      max: 20,
      title: "จุดเริ่มต้นแห่งความหวัง",
      desc: "เกาะเล็ก ๆ เริ่มมีต้นอ่อนและแสงแห่งความหวัง",
      range: "0 - 20%",
      image: "images/world-stage-1.png"
    },
    {
      stage: 2,
      min: 20,
      max: 40,
      title: "โลกเริ่มมีชีวิต",
      desc: "หญ้า ดอกไม้ ลำธาร และผีเสื้อเริ่มกลับมา",
      range: "20 - 40%",
      image: "images/world-stage-2.png"
    },
    {
      stage: 3,
      min: 40,
      max: 60,
      title: "เกาะแห่งชีวิต",
      desc: "น้ำตก นก และแสงลอดใบไม้ทำให้ทั้งเกาะมีชีวิต",
      range: "40 - 60%",
      image: "images/world-stage-3.png"
    },
    {
      stage: 4,
      min: 60,
      max: 80,
      title: "Forest Island",
      desc: "ต้นไม้ใหญ่ น้ำตก ดอกไม้ และคริสตัลสีเขียวเริ่มเปล่งประกาย",
      range: "60 - 80%",
      image: "images/world-stage-4.png"
    },
    {
      stage: 5,
      min: 80,
      max: 100,
      title: "Guardian Tree",
      desc: "ต้นไม้ผู้พิทักษ์เริ่มตื่นขึ้น พร้อมแสงและพลังแห่งธรรมชาติ",
      range: "80 - 100%",
      image: "images/world-stage-5.png"
    },
    {
      stage: 6,
      min: 100,
      max: Infinity,
      title: "World Tree of Bottle Battle",
      desc: "ภารกิจสำเร็จ โลก Bottle Battle ได้รับการฟื้นฟูอย่างสมบูรณ์",
      range: "100%+",
      image: "images/world-stage-6.png"
    }
  ];

  function el(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const node = el(id);
    if (node) node.textContent = value;
  }

  function getStage(percent) {
    return STAGES.find((stage) => percent >= stage.min && percent < stage.max) || STAGES[0];
  }

  function render(summary) {
    const totalKg = Number(summary.totalWeightKg || 0);
    const targetKg = Number(summary.seasonTargetKg || FALLBACK_TARGET_KG);
    const co2Kg = Number(summary.totalCo2Kg || 0);
    const activeClassrooms = Number(summary.activeClassrooms || 0);
    const trees = Number(summary.totalTrees || 0);
    const leader = summary.leadingClassroom || "–";

    const percent = targetKg > 0 ? (totalKg / targetKg) * 100 : 0;
    const displayPercent = Math.min(percent, 120);
    const stage = getStage(displayPercent);

    setText("worldStageBadge", `STAGE ${stage.stage}`);
    setText("worldStageRange", stage.range);
    setText("worldStageTitle", stage.title);
    setText("worldStageDesc", stage.desc);
    setText("worldProgressText", `${displayPercent.toFixed(1)}%`);
    setText("worldCurrentKg", totalKg.toFixed(1));
    setText("worldTargetKg", targetKg.toFixed(0));
    setText("worldTrees", trees.toLocaleString("th-TH"));

    setText("homeTotalWeight", totalKg.toFixed(1));
    setText("homeTotalCo2", co2Kg.toFixed(1));
    setText("homeActiveClassrooms", activeClassrooms.toLocaleString("th-TH"));
    setText("homeLeader", leader);

    const fill = el("worldProgressFill");
    if (fill) fill.style.width = `${Math.min(displayPercent, 100)}%`;

    const img = el("worldStageImage");
    if (img && img.getAttribute("src") !== stage.image) {
      img.style.opacity = "0";
      img.style.transform = "scale(.97)";
      setTimeout(() => {
        img.src = stage.image;
        img.onload = () => {
          img.style.opacity = "1";
          img.style.transform = "scale(1)";
        };
      }, 180);
    }

    const missionText = percent >= 100
      ? "🎉 ภารกิจสำเร็จ! โรงเรียนของคุณได้ฟื้นฟู Bottle Battle World สำเร็จแล้ว"
      : "ฟื้นฟู Bottle Battle World ให้ครบ 100%";

    setText("missionText", missionText);
  }

  async function init() {
    try {
      const summary = await Api.getSummary();
      render(summary || {});
    } catch (error) {
      console.warn("Home V3 ใช้ข้อมูลตัวอย่าง:", error.message);
      render({
        totalWeightKg: 33.5,
        totalCo2Kg: 50.25,
        seasonTargetKg: 100,
        activeClassrooms: 6,
        totalTrees: 1,
        leadingClassroom: "ม.1/4"
      });
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", HomeV3.init);
