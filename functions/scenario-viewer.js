/**
 * GET /scenario-viewer
 * Serve the scenario viewer HTML page with lazy pagination
 */

const HTML_CONTENT = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chombat Scenarios</title>
  <style>
    :root {
      --bg-color: #1a1a1a;
      --panel-bg: #2d2d2d;
      --text-color: #e0e0e0;
      --text-dim: #888;
      --accent-color: #f39c12;
      --border-color: #444;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-color);
      color: var(--text-color);
      margin: 0;
      padding: 20px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }
    .header img {
      width: 48px;
      height: 48px;
    }
    h1 { color: var(--accent-color); margin: 0; }
    .controls { margin-bottom: 20px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    button {
      background: var(--accent-color);
      color: black;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.small { padding: 4px 8px; font-size: 0.85rem; }
    input[type="text"] {
      background: var(--panel-bg);
      border: 1px solid var(--border-color);
      color: var(--text-color);
      padding: 8px;
      border-radius: 4px;
      width: 300px;
    }
    .stats {
      background: var(--panel-bg);
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .stat-item { text-align: center; }
    .stat-value { font-size: 2rem; font-weight: bold; color: var(--accent-color); }
    .stat-label { color: var(--text-dim); font-size: 0.85rem; }
    .scenario-list { display: grid; gap: 15px; }
    .scenario-item {
      background: var(--panel-bg);
      padding: 20px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      transition: all 0.2s;
    }
    .scenario-item:hover { border-color: var(--accent-color); }
    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .scenario-title {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .scenario-name { font-weight: bold; color: var(--accent-color); font-size: 1.1rem; }
    .scenario-id {
      font-family: monospace;
      background: var(--bg-color);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .scenario-matchup {
      color: var(--text-color);
      font-weight: bold;
      margin: 10px 0;
      font-size: 1rem;
    }
    .scenario-desc { color: var(--text-dim); font-size: 0.9rem; margin: 10px 0; }
    .scenario-meta {
      display: flex;
      gap: 20px;
      font-size: 0.85rem;
      color: var(--text-dim);
      flex-wrap: wrap;
      margin: 10px 0;
    }
    .meta-item { display: flex; align-items: center; gap: 5px; }
    .status-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .status-active { background: #2ecc71; color: black; }
    .status-expiring { background: #f39c12; color: black; }
    .status-expired { background: #e74c3c; color: white; }
    .scenario-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    .loading { text-align: center; padding: 40px; color: var(--text-dim); }
    .error {
      background: #e74c3c;
      color: white;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .json-toggle {
      background: transparent;
      color: var(--text-dim);
      border: 1px solid var(--border-color);
      padding: 4px 8px;
      font-size: 0.85rem;
      margin-top: 10px;
    }
    .json-toggle:hover {
      color: var(--accent-color);
      border-color: var(--accent-color);
    }
    .json-preview {
      background: var(--bg-color);
      padding: 15px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 400px;
      overflow-y: auto;
      margin-top: 10px;
      display: none;
    }
    .json-preview.open { display: block; }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .pagination button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .page-info {
      color: var(--text-dim);
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="/img/logo.png" alt="Chombat Logo" />
    <h1>Chombat Scenarios</h1>
  </div>
  <div class="controls">
    <button id="refresh-btn">🔄 Refresh</button>
    <input type="text" id="search-input" placeholder="Search by ID, name, units..." />
    <button id="sort-btn">📅 Sort: Newest First</button>
    <button id="clear-expired-btn">🗑️ Clear Expired</button>
  </div>
  <div id="stats-container" class="stats"><div class="loading">Loading stats...</div></div>
  <div id="error-container"></div>
  <div id="scenario-list" class="scenario-list"><div class="loading">Loading scenarios...</div></div>
  <div class="pagination">
    <button id="prev-btn" disabled>⏮️ Previous</button>
    <span class="page-info" id="page-info">Page 1 of 1</span>
    <button id="next-btn" disabled>Next ⏭️</button>
  </div>
  <script>
    let allKeys = [];
    let sortedKeys = [];
    let scenariosCache = {};
    let sortNewest = true;
    let currentPage = 1;
    const pageSize = 10;
    function formatTime(ms) { if (!ms) return 'N/A'; return new Date(ms).toLocaleString(); }
    function getTimeRemaining(expiresAt) {
      if (!expiresAt) return 'N/A';
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) return 'Expired';
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) return days + 'd ' + hours + 'h';
      if (hours > 0) return hours + 'h';
      return '< 1h';
    }
    function getStatusBadge(expiresAt) {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) return '<span class="status-badge status-expired">Expired</span>';
      else if (diff < 1000 * 60 * 60 * 24) return '<span class="status-badge status-expiring">Expiring Soon</span>';
      else return '<span class="status-badge status-active">Active</span>';
    }
    async function fetchKeys() {
      try {
        const response = await fetch('/api/kv-list');
        if (!response.ok) throw new Error('Failed to fetch KV list');
        const data = await response.json();
        return data.keys || [];
      } catch (error) {
        console.error('Error fetching keys:', error);
        throw error;
      }
    }
    async function fetchScenarioData(key) {
      if (scenariosCache[key]) return scenariosCache[key];
      try {
        const response = await fetch('/api/resolve/' + key);
        if (!response.ok) return null;
        const data = await response.json();
        const scenarioData = data?.data || {};
        scenariosCache[key] = {
          key: key,
          name: scenarioData.name || 'Unnamed',
          desc: scenarioData.desc || '',
          unitA: scenarioData.a?.nm || 'Unit A',
          unitB: scenarioData.b?.nm || 'Unit B',
          expiration: data?.expiresAt,
          metadata: data?.metadata,
          rawData: scenarioData
        };
        return scenariosCache[key];
      } catch (error) {
        console.error('Error fetching ' + key + ':', error);
        return null;
      }
    }
    function renderStats(total) {
      const now = Date.now();
      const cached = Object.values(scenariosCache);
      const active = cached.filter(s => s.expiration && s.expiration > now).length;
      const expiring = cached.filter(s => s.expiration && s.expiration > now && s.expiration < now + 1000 * 60 * 60 * 24).length;
      const expired = total - active;
      document.getElementById('stats-container').innerHTML = '<div class="stats-grid">' +
        '<div class="stat-item"><div class="stat-value">' + total + '</div><div class="stat-label">Total</div></div>' +
        '<div class="stat-item"><div class="stat-value">' + active + '</div><div class="stat-label">Active</div></div>' +
        '<div class="stat-item"><div class="stat-value">' + expiring + '</div><div class="stat-label">Expiring Soon</div></div>' +
        '<div class="stat-item"><div class="stat-value">' + expired + '</div><div class="stat-label">Expired</div></div>' +
      '</div>';
    }
    function renderPagination() {
      const totalPages = Math.ceil(sortedKeys.length / pageSize);
      const start = (currentPage - 1) * pageSize;
      const end = Math.min(currentPage * pageSize, sortedKeys.length);
      document.getElementById('page-info').textContent = 'Page ' + currentPage + ' of ' + totalPages + ' (Showing ' + start + '-' + end + ' of ' + sortedKeys.length + ')';
      document.getElementById('prev-btn').disabled = currentPage === 1;
      document.getElementById('next-btn').disabled = currentPage >= totalPages;
    }
    async function renderScenarios() {
      const container = document.getElementById('scenario-list');
      const start = (currentPage - 1) * pageSize;
      const pageKeys = sortedKeys.slice(start, start + pageSize);
      if (pageKeys.length === 0) {
        container.innerHTML = '<div class="loading">No scenarios found</div>';
        return;
      }
      container.innerHTML = '<div class="loading">Loading page ' + currentPage + '...</div>';
      const pageItems = await Promise.all(pageKeys.map(key => fetchScenarioData(key)));
      const filtered = pageItems.filter(s => s);
      if (filtered.length === 0) {
        container.innerHTML = '<div class="loading">No scenarios found</div>';
        return;
      }
      container.innerHTML = filtered.map(s => '<div class="scenario-item">' +
        '<div class="scenario-header">' +
        '<div class="scenario-title">' +
        '<span class="scenario-name">' + (s.name || 'Unnamed Scenario') + '</span>' +
        '<span class="scenario-id">' + s.key + '</span>' +
        getStatusBadge(s.expiration) +
        '</div>' +
        '</div>' +
        '<div class="scenario-matchup">⚔️ ' + (s.unitA || 'Unit A') + ' vs ' + (s.unitB || 'Unit B') + '</div>' +
        (s.desc ? '<div class="scenario-desc">' + s.desc + '</div>' : '') +
        '<div class="scenario-meta">' +
        '<div class="meta-item">⏰ Expires: ' + formatTime(s.expiration) + '</div>' +
        '<div class="meta-item">🕐 Time Left: ' + getTimeRemaining(s.expiration) + '</div>' +
        '<div class="meta-item">📅 Created: ' + formatTime(s.metadata?.createdAt) + '</div>' +
        '<div class="meta-item">👁️ Accessed: ' + formatTime(s.metadata?.accessedAt) + '</div>' +
        '</div>' +
        '<div class="scenario-actions">' +
        '<a href="/#' + s.key + '" target="_blank"><button class="small">🔗 Open Scenario</button></a>' +
        '<button class="small" onclick="copyLink(\\'' + s.key + '\\')">📋 Copy Link</button>' +
        '<button class="small json-toggle" onclick="toggleJson(this)">📄 Show Raw Data</button>' +
        '</div>' +
        '<div class="json-preview">' + JSON.stringify(s.rawData, null, 2) + '</div>' +
        '</div>'
      ).join('');
      renderPagination();
    }
    function copyLink(key) {
      const url = window.location.origin + '/#' + key;
      navigator.clipboard.writeText(url).then(() => { alert('Link copied to clipboard!'); });
    }
    function toggleJson(btn) {
      const preview = btn.parentElement.nextElementSibling;
      if (preview.classList.contains('open')) {
        preview.classList.remove('open');
        btn.textContent = '📄 Hide Raw Data';
      } else {
        preview.classList.add('open');
        btn.textContent = '📄 Show Raw Data';
      }
    }
    async function clearExpired() {
      if (!confirm('Are you sure you want to clear all expired scenarios?')) return;
      try {
        const response = await fetch('/api/kv-clear-expired', { method: 'POST' });
        const result = await response.json();
        alert('Cleared ' + (result.deleted || 0) + ' expired scenarios');
        scenariosCache = {};
        await loadScenarios();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
    async function loadScenarios() {
      try {
        document.getElementById('stats-container').innerHTML = '<div class="loading">Loading...</div>';
        document.getElementById('scenario-list').innerHTML = '<div class="loading">Loading scenarios...</div>';
        document.getElementById('error-container').innerHTML = '';
        allKeys = await fetchKeys();
        sortedKeys = [...allKeys];
        scenariosCache = {};
        currentPage = 1;
        renderStats(allKeys.length);
        await renderScenarios();
      } catch (error) {
        document.getElementById('error-container').innerHTML = '<div class="error">Error loading scenarios: ' + error.message + '</div>';
      }
    }
    document.getElementById('refresh-btn').addEventListener('click', loadScenarios);
    document.getElementById('clear-expired-btn').addEventListener('click', clearExpired);
    document.getElementById('sort-btn').addEventListener('click', function() {
      sortNewest = !sortNewest;
      this.textContent = sortNewest ? '📅 Sort: Newest First' : '📅 Sort: Oldest First';
      sortedKeys.sort((a, b) => {
        const timeA = scenariosCache[a]?.metadata?.createdAt || 0;
        const timeB = scenariosCache[b]?.metadata?.createdAt || 0;
        return sortNewest ? timeB - timeA : timeA - timeB;
      });
      currentPage = 1;
      renderScenarios();
    });
    document.getElementById('prev-btn').addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        renderScenarios();
      }
    });
    document.getElementById('next-btn').addEventListener('click', function() {
      const totalPages = Math.ceil(sortedKeys.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        renderScenarios();
      }
    });
    loadScenarios();
  </script>
</body>
</html>`;

export async function onRequest() {
  return new Response(HTML_CONTENT, {
    headers: { 'Content-Type': 'text/html' },
  });
}
