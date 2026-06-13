#!/usr/bin/env node
/*
 * VulnScan pre-commit hook — blocks commits containing secrets.
 *
 * Install:
 *   cp pre-commit-hook/scan-pre-commit.js .git/hooks/pre-commit
 *   chmod +x .git/hooks/pre-commit   # macOS / Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');

const SECRET_PATTERNS = [
  { name: 'AWS Access Key',         pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Block',      pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { name: 'GitHub Token',           pattern: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'MongoDB Connection URI', pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/ },
  { name: 'Hardcoded Password',     pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{8,})['"]/i },
  { name: 'Generic API Key',        pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{20,}/i },
  { name: 'Slack Token',            pattern: /xox[baprs]-[0-9A-Za-z]{10,}/ },
];

function getStagedFiles() {
  try {
    return execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' })
      .trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return SECRET_PATTERNS
      .filter(rule => rule.pattern.test(content))
      .map(rule => rule.name);
  } catch {
    return [];
  }
}

function main() {
  const files = getStagedFiles();
  let blocked = false;

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const hits = checkFile(file);
    if (hits.length > 0) {
      console.error(`\n[VulnScan] Blocked — potential secrets in: ${file}`);
      hits.forEach(h => console.error(`  - ${h}`));
      blocked = true;
    }
  }

  if (blocked) {
    console.error('\n[VulnScan] Commit aborted. Remove secrets before committing.\n');
    process.exit(1);
  }
}

main();
