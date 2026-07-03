/**
 * ============================================================
 * HISTORY.JS — Search, filter, sort, paginate, export, print
 * ============================================================
 */

const HistoryPage = (() => {
  let allRecords = [];
  let filteredRecords = [];
  let currentPage = 1;
  let sortBy = 'collectionDate';
  let sortDir = 'desc';
  let historyChart = null;

  const els = {};

  function cacheEls() {
    els.search = document.getElementById('searchInput');
    els.filterClassroom = document.getElementById('filterClassroom');
    els.filterFrom = document.getElementById('filterFrom');
    els.filterTo = document.getElementById('filterTo');
    els.tbody = document.getElementById('historyTbody');
    els.paginationInfo = document.getElementById('paginationInfo');
    els.paginationControls = document.getElementById('paginationControls');
    els.sumRecords = document.getElementById('sumRecords');
    els.sumWeight = document.getElementById('sumWeight');
    els.sumClassrooms = document.getElementById('sumClassrooms');
    els.sumAvg = document.getElementById('sumAvg');
  }

  function populateClassroomFilter() {
    CONFIG.CLASSROOMS.forEach((room) => {
      const opt = document.createElement('option');
      opt.value = room;
      opt.textContent = room;
      els.filterClassroom.appendChild(opt);
    });
  }

  /** Apply search text, classroom, and date-range filters to allRecords. */
  function applyFilters() {
    const term = els.search.value.trim().toLowerCase();
    const classroom = els.filterClassroom.value;
    const from = els.filterFrom.value;
    const to = els.filterTo.value;

    filteredRecords = allRecords.filter((r) => {
      const matchesTerm = !term ||
        r.studentName.toLowerCase().includes(term) ||
        r.classroom.toLowerCase().includes(term) ||
        (r.notes || '').toLowerCase().includes(term);
      const matchesClassroom = !classroom || r.classroom === classroom;
      const matchesFrom = !from || r.collectionDate >= from;
      const matchesTo = !to || r.collectionDate <= to;
      return matchesTerm && matchesClassroom && matchesFrom && matchesTo;
    });

    applySort();
    currentPage = 1;
    renderAll();
  }

  function applySort() {
    filteredRecords.sort((a, b) => {
      let va = a[sortBy];
      let vb = b[sortBy];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function renderSummary() {
    const totalWeight = filteredRecords.reduce((sum, r) => sum + r.weightKg, 0);
    const classrooms = new Set(filteredRecords.map((r) => r.classroom));
    els.sumRecords.textContent = filteredRecords.length.toLocaleString();
    els.sumWeight.textContent = `${totalWeight.toFixed(1)} kg`;
    els.sumClassrooms.textContent = classrooms.size;
    els.sumAvg.textContent = `${(filteredRecords.length ? totalWeight / filteredRecords.length : 0).toFixed(1)} kg`;
  }

  function renderTable() {
    const pageSize = CONFIG.HISTORY_PAGE_SIZE;
    const start = (currentPage - 1) * pageSize;
    const pageItems = filteredRecords.slice(start, start + pageSize);

    if (!pageItems.length) {
      els.tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No records match your filters.</td></tr>';
    } else {
      els.tbody.innerHTML = pageItems.map((r) => `
        <tr>
          <td>${formatDate(r.collectionDate)}</td>
          <td class="cell-classroom">${r.classroom}</td>
          <td>${r.studentName}</td>
          <td>${r.weightKg.toFixed(1)} kg</td>
          <td class="cell-notes" title="${escapeAttr(r.notes || '')}">${r.notes || '—'}</td>
          <td>${r.imageUrl ? `<img class="cell-thumb" src="${r.imageUrl}" alt="Evidence photo for ${r.classroom}" loading="lazy">` : '—'}</td>
        </tr>
      `).join('');
    }

    renderPagination(pageSize);
  }

  function renderPagination(pageSize) {
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
    const start = filteredRecords.length ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, filteredRecords.length);
    els.paginationInfo.textContent = `Showing ${start}-${end} of ${filteredRecords.length}`;

    let html = `<button class="page-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>&lsaquo;</button>`;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
        html += `<button class="page-btn ${p === currentPage ? 'is-active' : ''}" data-page="${p}">${p}</button>`;
      } else if (Math.abs(p - currentPage) === 2) {
        html += `<span class="page-btn" style="border:none;background:none;">…</span>`;
      }
    }
    html += `<button class="page-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>&rsaquo;</button>`;
    els.paginationControls.innerHTML = html;

    els.paginationControls.querySelectorAll('.page-btn[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page === 'prev') currentPage = Math.max(1, currentPage - 1);
        else if (page === 'next') currentPage = Math.min(totalPages, currentPage + 1);
        else currentPage = parseInt(page, 10);
        renderTable();
      });
    });
  }

  function renderChart() {
    // Group filtered records by date for a simple bar chart.
    const byDate = {};
    filteredRecords.forEach((r) => {
      byDate[r.collectionDate] = (byDate[r.collectionDate] || 0) + r.weightKg;
    });
    const labels = Object.keys(byDate).sort();
    const values = labels.map((d) => byDate[d]);

    const ctx = document.getElementById('historyChart');
    if (!isChartJsReady()) {
      renderChartUnavailable(ctx);
      return;
    }
    if (historyChart) historyChart.destroy();
    historyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(formatDate),
        datasets: [{ label: 'kg collected', data: values, backgroundColor: '#12b76a', borderRadius: 6, maxBarThickness: 28 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(128,128,128,0.12)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function renderAll() {
    renderSummary();
    renderTable();
    renderChart();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  /** Build and download a CSV file from the currently filtered records. */
  function exportCsv() {
    if (!filteredRecords.length) {
      Toast.warning('No records to export.');
      return;
    }
    const headers = ['Date', 'Classroom', 'Student Name', 'Weight (kg)', 'Notes'];
    const rows = filteredRecords.map((r) => [
      r.collectionDate, r.classroom, r.studentName, r.weightKg.toFixed(1), (r.notes || '').replace(/"/g, '""')
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bottle-battle-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    Toast.success('CSV exported.');
  }

  function initSortableHeaders() {
    document.querySelectorAll('#historyTable thead th[data-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (sortBy === field) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortBy = field;
          sortDir = 'asc';
        }
        document.querySelectorAll('#historyTable thead th').forEach((h) => h.classList.remove('is-sorted'));
        th.classList.add('is-sorted');
        applySort();
        renderTable();
      });
    });
  }

  function initToolbar() {
    let debounceTimer;
    els.search.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 250);
    });
    [els.filterClassroom, els.filterFrom, els.filterTo].forEach((el) => {
      el.addEventListener('change', applyFilters);
    });
    document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
    document.getElementById('printBtn').addEventListener('click', () => window.print());
  }

  async function loadData() {
    try {
      const history = await Api.getHistory({});
      allRecords = history || [];
      filteredRecords = allRecords.slice();
      applySort();
      renderAll();
    } catch (err) {
      els.tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Could not load history: ${err.message}</td></tr>`;
      Toast.error(`Could not load history: ${err.message}`);
    }
  }

  function init() {
    cacheEls();
    populateClassroomFilter();
    initSortableHeaders();
    initToolbar();
    loadData();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', HistoryPage.init);
