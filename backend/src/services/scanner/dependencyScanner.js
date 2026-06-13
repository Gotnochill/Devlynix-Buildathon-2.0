const axios = require('axios');

const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

async function queryNVD(packageName) {
  try {
    const headers = {};
    if (process.env.NVD_API_KEY) headers['apiKey'] = process.env.NVD_API_KEY;

    const res = await axios.get(NVD_BASE, {
      params: { keywordSearch: packageName, resultsPerPage: 5 },
      headers,
      timeout: 8000,
    });

    return res.data?.vulnerabilities || [];
  } catch {
    return [];
  }
}

async function scanDependencies(packageJson) {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Limit to first 15 packages to avoid NVD rate limits
  const entries = Object.entries(deps).slice(0, 15);
  const findings = [];

  for (const [name, versionRange] of entries) {
    const vulns = await queryNVD(name);

    for (const vuln of vulns) {
      const cve = vuln.cve;
      const metric =
        cve.metrics?.cvssMetricV31?.[0] ||
        cve.metrics?.cvssMetricV30?.[0] ||
        cve.metrics?.cvssMetricV2?.[0];
      const score = metric?.cvssData?.baseScore ?? 0;

      if (score >= 7.0) {
        findings.push({
          type: 'vulnerable-dependency',
          severity: score >= 9.0 ? 'critical' : 'high',
          title: `${name}@${versionRange} — ${cve.id}`,
          description:
            cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description available.',
          location: 'package.json',
          cveId: cve.id,
          score,
        });
      }
    }

    // Small delay to respect NVD rate limits when no API key is provided
    if (!process.env.NVD_API_KEY) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return findings;
}

module.exports = { scanDependencies };
