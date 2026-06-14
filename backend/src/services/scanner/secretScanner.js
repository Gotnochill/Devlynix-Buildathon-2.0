const SECRET_PATTERNS = [
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/,
    severity: 'critical',
  },
  {
    name: 'Private Key Block',
    pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
    severity: 'critical',
  },
  {
    name: 'GitHub Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
    severity: 'critical',
  },
  {
    name: 'MongoDB Connection URI',
    pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/,
    severity: 'critical',
  },
  {
    name: 'Generic API Key Assignment',
    pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{20,}/i,
    severity: 'high',
  },
  {
    name: 'Hardcoded Secret or Password',
    pattern: /(?:secret|password|passwd|pwd)\s*[:=]\s*['"]([^'"]{8,})['"]/i,
    severity: 'high',
  },
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[0-9A-Za-z]{10,}/,
    severity: 'high',
  },
];

function scanSecrets(content, filePath) {
  const findings = [];

  for (const rule of SECRET_PATTERNS) {
    if (rule.pattern.test(content)) {
      findings.push({
        type: 'exposed-secret',
        severity: rule.severity,
        title: `Potential ${rule.name} found`,
        description: `Pattern "${rule.name}" matched in file content.`,
        location: filePath,
      });
    }
  }

  return findings;
}

module.exports = { scanSecrets };
