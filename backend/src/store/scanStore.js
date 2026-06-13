const scans = new Map();

function createScan(id, meta) {
  const scan = {
    id,
    status: 'queued',
    target: meta.target,
    type: meta.type,
    findings: [],
    summary: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  scans.set(id, scan);
  return scan;
}

function getScan(id) {
  return scans.get(id) || null;
}

function updateScan(id, updates) {
  const scan = scans.get(id);
  if (!scan) return null;
  Object.assign(scan, updates);
  return scan;
}

function addFinding(id, finding) {
  const scan = scans.get(id);
  if (!scan) return null;
  scan.findings.push(finding);
  return finding;
}

module.exports = { createScan, getScan, updateScan, addFinding };
