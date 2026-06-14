const axios = require('axios');

const REDHAT_BASE = 'https://access.redhat.com/labs/securitydataapi';
const GH_ADVISORY_BASE = 'https://api.github.com/advisories';

// GitHub Advisory uses different ecosystem identifiers than we do internally
const GH_ECOSYSTEM = {
  npm:      'npm',
  pypi:     'pip',
  gem:      'rubygems',
  maven:    'maven',
  go:       'go',
  cargo:    'cargo',
  composer: 'composer',
};

async function searchGitHubAdvisory(packageName, ecosystem) {
  try {
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await axios.get(GH_ADVISORY_BASE, {
      params: { affects: packageName, per_page: 10 },
      headers,
      timeout: 8000,
    });

    const ghEco = GH_ECOSYSTEM[ecosystem] || ecosystem;

    return (res.data || [])
      .filter(a =>
        // Keep only advisories that explicitly affect this ecosystem
        a.vulnerabilities?.some(v =>
          v.package.ecosystem.toLowerCase() === ghEco.toLowerCase() &&
          v.package.name.toLowerCase() === packageName.toLowerCase()
        )
      )
      .map(a => ({
        id: a.cve_id || a.ghsa_id,
        ghsaId: a.ghsa_id,
        description: a.summary || a.description || '',
        severity: a.severity || 'unknown',
        score: a.cvss?.score || a.cvss_severities?.cvss_v3?.score || null,
        patchedVersion: a.vulnerabilities?.find(
          v => v.package.name.toLowerCase() === packageName.toLowerCase()
        )?.first_patched_version || null,
        source: 'github',
      }));
  } catch {
    return [];
  }
}

async function searchRedHat(keyword) {
  try {
    const res = await axios.get(`${REDHAT_BASE}/cve.json`, {
      params: { keyword, per_page: 5 },
      timeout: 8000,
    });
    return (res.data || []).map(cve => ({
      id: cve.CVE,
      description: cve.bugzilla_description || '',
      severity: cve.severity || 'unknown',
      publicDate: cve.public_date,
      source: 'redhat',
    }));
  } catch {
    return [];
  }
}

async function lookupCVE(packageName, ecosystem) {
  const [github, redhat] = await Promise.all([
    searchGitHubAdvisory(packageName, ecosystem),
    searchRedHat(packageName),
  ]);
  return [...github, ...redhat];
}

module.exports = { lookupCVE };
