const axios = require('axios');

const REDHAT_BASE = 'https://access.redhat.com/labs/securitydataapi';
const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

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

async function searchNVD(keyword) {
  try {
    const headers = {};
    if (process.env.NVD_API_KEY) headers['apiKey'] = process.env.NVD_API_KEY;

    const res = await axios.get(NVD_BASE, {
      params: { keywordSearch: keyword, resultsPerPage: 5 },
      headers,
      timeout: 8000,
    });

    return (res.data?.vulnerabilities || []).map(v => {
      const cve = v.cve;
      const metric =
        cve.metrics?.cvssMetricV31?.[0] ||
        cve.metrics?.cvssMetricV30?.[0] ||
        cve.metrics?.cvssMetricV2?.[0];
      return {
        id: cve.id,
        description: cve.descriptions?.find(d => d.lang === 'en')?.value || '',
        score: metric?.cvssData?.baseScore,
        severity: metric?.cvssData?.baseSeverity?.toLowerCase() || 'unknown',
        source: 'nvd',
      };
    });
  } catch {
    return [];
  }
}

async function lookupCVE(keyword) {
  const [redhat, nvd] = await Promise.all([searchRedHat(keyword), searchNVD(keyword)]);
  return [...redhat, ...nvd];
}

module.exports = { lookupCVE };
