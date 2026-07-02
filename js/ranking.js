/**
 * ============================================================
 * RANKING.JS — Podium, leaderboard, rank movement, confetti
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
      podium.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">No submissions yet.</p>';
      return;
    }
    const medalEmoji = ['🥇', '🥈', '🥉'];
    podium.innerHTML = top3.map((r, i) => `
      <div class="podium-slot rank-${i + 1} reveal is-visible">
        <div class="podium-avatar">
          ${i === 0 ? '<span class="podium-crown">👑</span>' : ''}
          ${initials(r.classroom)}
        </div>
        <div class="podium-name">${r.classroom}</div>
        <div class="podium-weight">${r.weightKg.toFixed(1)} kg · ${r.points.toLocaleString()} pts</div>
        <div class="podium-block">${medalEmoji[i]}</div>
      </div>
    `).join('');
  }

  function moveIcon(current, previous) {
    if (!previous || previous === current) {
      return { cls: 'same', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>' };
    }
    if (previous > current) {
      return { cls: 'up', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>' };
    }
    return { cls: 'down', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>' };
  }

  function renderLeaderboard(ranking) {
    const list = document.getElementById('leaderboardList');
    if (!ranking.length) {
      list.innerHTML = '<p style="padding:var(--space-4);text-align:center;color:var(--text-muted);">No collections submitted yet. Be the first classroom!</p>';
      return;
    }
    list.innerHTML = ranking.map((r) => {
      const move = moveIcon(r.rank, r.previousRank);
      return `
        <div class="leaderboard-row reveal is-visible">
          <span class="rank-num">${r.rank}</span>
          <span class="rank-classroom">
            <span class="rank-avatar">${initials(r.classroom)}</span>
            <span>
              <span class="name">${r.classroom}</span><br>
              <span class="sub">${r.participants || 0} participants</span>
            </span>
          </span>
          <span class="rank-weight">${r.weightKg.toFixed(1)} kg</span>
          <span class="rank-points">${r.points.toLocaleString()} pts</span>
          <span class="rank-move ${move.cls}" title="Rank movement">${move.svg}</span>
        </div>
      `;
    }).join('');
  }

  /** Compare the new #1 classroom against the last known leader and fire confetti on change. */
  function checkLeaderChange(ranking) {
    if (!ranking.length) return;
    const newLeader = ranking[0].classroom;
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
      renderLeaderboard(sorted);
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
