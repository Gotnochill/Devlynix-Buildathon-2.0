const BACKEND_URL = 'http://3.107.241.205:3001';
const FRONTEND_URL = 'http://3.107.241.205:5173';
const POLL_INTERVAL = 3000;

const $ = id => document.getElementById(id);

let pollTimer = null;
let currentScanId = null;

function isGithubRepo(url) {
  return /github\.com\/[^/]+\/[^/]+/.test(url);
}

function setView(name) {
  ['idle-view', 'progress-view', 'results-view'].forEach(id => {
    $(id).style.display = id === `${name}-view` ? '' : 'none';
  });
}

function setBadge(text, cls) {
  const el = $('status-badge');
  el.textContent = text;
  el.className = `badge ${cls}`;
}

function renderSummary(summary) {
  const grid = $('summary');
  grid.innerHTML = ['critical', 'high', 'medium', 'low'].map(sev => `
    <div class="summary-tile ${sev}">
      <div class="count">${summary[sev] ?? 0}</div>
      <div class="label">${sev}</div>
    </div>
  `).join('');
}

function renderFindings(findings) {
  const list = $('findings');
  if (findings.length === 0) {
    list.innerHTML = '<p class="no-findings">No findings detected.</p>';
    return;
  }
  list.innerHTML = findings.map(f => `
    <div class="finding">
      <div class="finding-title">
        <span class="sev-badge sev-${f.severity}">${f.severity}</span>${f.title}
      </div>
      ${f.location ? `<div class="finding-loc">${f.location}</div>` : ''}
    </div>
  `).join('');
}

async function getActiveTabUrl() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0]?.url || '');
    });
  });
}

async function getRepoUrl() {
  const [tab] = await new Promise(resolve =>
    chrome.tabs.query({ active: true, currentWindow: true }, resolve)
  );
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tab.id, { type: 'GET_REPO_URL' }, res => {
      resolve(res?.url || tab.url);
    });
  });
}

function startPolling(scanId) {
  currentScanId = scanId;
  pollTimer = setInterval(async () => {
    const res = await chrome.runtime.sendMessage({
      type: 'POLL_SCAN',
      backendUrl: BACKEND_URL,
      scanId,
    });

    if (!res.ok) return;
    const scan = res.scan;

    if (scan.status === 'running' || scan.status === 'queued') {
      // still running — update nothing
      return;
    }

    clearInterval(pollTimer);

    if (scan.status === 'completed') {
      setBadge('completed', 'completed');
      renderSummary(scan.summary || {});
      renderFindings(scan.findings || []);
      $('full-report-link').href = `${FRONTEND_URL}/report/${scanId}`;
      setView('results');
    } else {
      setBadge('failed', 'failed');
      $('findings').innerHTML = `<p class="no-findings" style="color:#f87171">${scan.error || 'Scan failed'}</p>`;
      $('summary').innerHTML = '';
      $('full-report-link').href = '#';
      setView('results');
    }
  }, POLL_INTERVAL);
}

async function init() {
  const url = await getActiveTabUrl();

  if (!isGithubRepo(url)) {
    $('repo-url').textContent = 'Navigate to a GitHub repo to scan it.';
    return;
  }

  const short = url.replace('https://github.com/', '');
  $('repo-url').textContent = short;
  $('scan-btn').disabled = false;

  $('scan-btn').addEventListener('click', async () => {
    const repoUrl = await getRepoUrl();
    setBadge('running', 'running');
    $('progress-msg').textContent = 'Starting scan...';
    setView('progress');

    const res = await chrome.runtime.sendMessage({
      type: 'START_SCAN',
      backendUrl: BACKEND_URL,
      target: repoUrl,
    });

    if (!res.ok) {
      setBadge('failed', 'failed');
      $('findings').innerHTML = `<p class="no-findings" style="color:#f87171">${res.error}</p>`;
      $('summary').innerHTML = '';
      $('full-report-link').href = '#';
      setView('results');
      return;
    }

    startPolling(res.scanId);
  });

  $('reset-btn').addEventListener('click', () => {
    clearInterval(pollTimer);
    $('status-badge').textContent = '';
    $('status-badge').className = 'badge';
    setView('idle');
  });
}

init();
