/**
 * ============================================================
 * RANKING.JS — Compact ranking card (podium + rank 4-10 grid)
 * ============================================================
 */

const RankingPage = (() => {
  const REFRESH_MS = 45000;

  /** Initials used for the round avatar badges, e.g. "M.3/2" -> "M3". */
  function initials(classroom) {
    const match = classroom.match(/[A-Za-z]+|\d+/g) || [];
    return (match[0] || '').slice(0, 1).toUpperCase() + (match[1] || '').slice(0, 1);
  }

  function renderPodium(top3) {
    const podium = document.getElementById('podium');
    if (!top3.length) {
      podium.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,.6);">ยังไม่มีข้อมูล</p>';
      return;
    }
    podium.innerHTML = top3.map((r, i) => `
      <div class="podium-slot rank-${i + 1}">
        <div class="podium-avatar">
          ${i === 0 ? '<span class="podium-crown">👑</span>' : ''}
          ${initials(r.classroom)}
          <span class="podium-rank-badge">${i + 1}</span>
        </div>
        <div class="podium-name">${r.classroom}</div>
        <div class="podium-weight">${r.weightKg.toFixed(2)} kg</div>
      </div>
    `).join('');
  }

  function renderRankGrid(rest) {
    const grid = document.getElementById('rankGrid');
    if (!rest.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,.6);">ยังไม่มีข้อมูลเพิ่มเติม</p>';
      return;
    }
    grid.innerHTML = rest.map((r) => `
      <div class="rank-grid-item">
        <span class="badge-num">${r.rank}</span>
        <span class="cn">${r.classroom}</span>
        <span class="wt">${r.weightKg.toFixed(2)} kg</span>
      </div>
    `).join('');
  }
  /** Compare the new #1 classroom against the last known leader and fire confetti on change. */
  function checkLeaderChange(sorted) {
    if (!sorted.length) return;
    const newLeader = sorted[0].classroom;
    const lastLeader = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_LEADER);
    if (lastLeader && lastLeader !== newLeader) {
      Confetti.fire();
      Toast.success(`🎉 New leader: ${newLeader}!`);
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_LEADER, newLeader);
  }

  async function refresh() {
    try {
      const ranking = await Api.getRanking();
      const sorted = (ranking || []).slice().sort((a, b) => a.rank - b.rank);
      renderPodium(sorted.slice(0, 3));
      renderRankGrid(sorted.slice(3, 10));
      renderTargetNote(sorted);
      checkLeaderChange(sorted);
    } catch (err) {
      Toast.error(`Could not load ranking: ${err.message}`);
    }
  }

  function init() {
    refresh();
    setInterval(refresh, REFRESH_MS);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', RankingPage.init);
