const axios = require('axios');

const REQUIRED_HEADERS = [
  {
    name: 'strict-transport-security',
    severity: 'high',
    description: 'Missing HSTS. Forces browsers to use HTTPS, preventing downgrade attacks.',
  },
  {
    name: 'content-security-policy',
    severity: 'high',
    description: 'Missing CSP. Allows XSS and data injection attacks.',
  },
  {
    name: 'x-content-type-options',
    severity: 'medium',
    description: 'Missing X-Content-Type-Options. Browser may MIME-sniff responses.',
  },
  {
    name: 'x-frame-options',
    severity: 'medium',
    description: 'Missing X-Frame-Options. Site is vulnerable to clickjacking.',
  },
  {
    name: 'referrer-policy',
    severity: 'low',
    description: 'Missing Referrer-Policy. Sensitive URL data may leak to third parties.',
  },
  {
    name: 'permissions-policy',
    severity: 'low',
    description: 'Missing Permissions-Policy. Browser features are uncontrolled.',
  },
];

async function scanHeaders(url) {
  let response;
  try {
    response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
  } catch (err) {
    return [{
      type: 'scan-error',
      severity: 'critical',
      title: 'URL unreachable',
      description: err.message,
      location: url,
    }];
  }

  const headers = response.headers;
  const findings = [];

  for (const rule of REQUIRED_HEADERS) {
    if (!headers[rule.name]) {
      findings.push({
        type: 'missing-header',
        severity: rule.severity,
        title: `Missing ${rule.name}`,
        description: rule.description,
        location: url,
      });
    }
  }

  if (headers['server'] && /\d/.test(headers['server'])) {
    findings.push({
      type: 'info-disclosure',
      severity: 'low',
      title: 'Server version disclosed',
      description: `Server header exposes version info: ${headers['server']}`,
      location: url,
    });
  }

  if (headers['x-powered-by']) {
    findings.push({
      type: 'info-disclosure',
      severity: 'low',
      title: 'Technology stack disclosed via X-Powered-By',
      description: `X-Powered-By: ${headers['x-powered-by']}`,
      location: url,
    });
  }

  return findings;
}

module.exports = { scanHeaders };
