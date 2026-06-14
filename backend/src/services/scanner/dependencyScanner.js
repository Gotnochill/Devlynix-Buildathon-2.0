const { lookupCVE } = require('../cve/cveService');

const REDHAT_SEVERITY_MAP = {
  critical: 'critical',
  important: 'high',
  moderate: 'medium',
  low: 'low',
};

function normalizeSeverity(cve) {
  if (cve.source === 'nvd') {
    if (!cve.score) return null;
    if (cve.score >= 9.0) return 'critical';
    if (cve.score >= 7.0) return 'high';
    return null;
  }
  if (cve.source === 'redhat') {
    const mapped = REDHAT_SEVERITY_MAP[cve.severity?.toLowerCase()];
    if (!mapped || mapped === 'medium' || mapped === 'low') return null;
    return mapped;
  }
  return null;
}

// deps: [{ name, version, ecosystem }]
async function scanDependencies(deps) {
  const findings = [];
  const seen = new Set();

  for (const { name, version, ecosystem } of deps.slice(0, 15)) {
    const cves = await lookupCVE(name);

    for (const cve of cves) {
      const key = `${name}::${cve.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const severity = normalizeSeverity(cve);
      if (!severity) continue;

      findings.push({
        type: 'vulnerable-dependency',
        severity,
        title: `${name}@${version} — ${cve.id}`,
        description: cve.description || 'No description available.',
        location: ecosystem ? `${ecosystem} manifest` : 'package manifest',
        cveId: cve.id,
        score: cve.score || null,
        source: cve.source,
      });
    }

    if (!process.env.NVD_API_KEY) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return findings;
}

module.exports = { scanDependencies };
