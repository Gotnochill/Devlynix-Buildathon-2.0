const { updateScan, addFinding, getScan } = require('../store/scanStore');
const { scanHeaders } = require('./scanner/headerScanner');
const { scanSecrets } = require('./scanner/secretScanner');
const { scanDependencies } = require('./scanner/dependencyScanner');
const { extractAllDeps } = require('./scanner/manifestParser');
const { fetchRepoData } = require('./github/githubService');
const { emitProgress } = require('../sockets/scanSocket');

async function runScan(scanId, target, type) {
  updateScan(scanId, { status: 'running' });
  emitProgress(scanId, { status: 'running', message: 'Scan started' });

  try {
    if (type === 'url') {
      await runUrlScan(scanId, target);
    } else {
      await runGithubScan(scanId, target);
    }

    const summary = buildSummary(scanId);
    updateScan(scanId, { status: 'completed', completedAt: new Date().toISOString(), summary });
    emitProgress(scanId, { status: 'completed', summary });
  } catch (err) {
    updateScan(scanId, { status: 'failed', error: err.message });
    emitProgress(scanId, { status: 'failed', error: err.message });
  }
}

async function runUrlScan(scanId, url) {
  emitProgress(scanId, { message: 'Scanning HTTP security headers...' });
  const findings = await scanHeaders(url);
  for (const f of findings) {
    addFinding(scanId, f);
    emitProgress(scanId, { finding: f });
  }
}

async function runGithubScan(scanId, repoUrl) {
  emitProgress(scanId, { message: 'Fetching repository...' });
  const repoData = await fetchRepoData(repoUrl);

  emitProgress(scanId, { message: `Scanning ${repoData.files.length} files for secrets...` });
  for (const file of repoData.files) {
    const findings = scanSecrets(file.content, file.path);
    for (const f of findings) {
      addFinding(scanId, f);
      emitProgress(scanId, { finding: f });
    }
  }

  const allDeps = extractAllDeps(repoData);
  if (allDeps.length > 0) {
    const ecosystems = [...new Set(allDeps.map(d => d.ecosystem))].join(', ');
    emitProgress(scanId, { message: `Checking ${allDeps.length} dependencies (${ecosystems}) for CVEs...` });
    const findings = await scanDependencies(allDeps);
    for (const f of findings) {
      addFinding(scanId, f);
      emitProgress(scanId, { finding: f });
    }
  }
}

function buildSummary(scanId) {
  const scan = getScan(scanId);
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of scan.findings) {
    if (counts[f.severity] !== undefined) counts[f.severity]++;
  }
  return { total: scan.findings.length, ...counts };
}

module.exports = { runScan };
