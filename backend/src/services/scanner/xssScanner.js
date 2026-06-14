const XSS_PATTERNS = [
  {
    name: 'Reflected PHP output',
    pattern: /echo\s+\$_(GET|POST|REQUEST|COOKIE)\s*\[/,
    severity: 'critical',
    description: 'Direct output of HTTP request parameters without sanitization allows reflected XSS.',
  },
  {
    name: 'Unsafe innerHTML assignment',
    pattern: /\.innerHTML\s*=\s*(?!['"`])/,
    severity: 'high',
    description: 'Direct innerHTML assignment with a variable allows XSS if the value contains user input. Use textContent or a sanitizer instead.',
  },
  {
    name: 'jQuery .html() with variable',
    pattern: /\$\([^)]*\)\.html\s*\(\s*(?!['"`])/,
    severity: 'high',
    description: 'jQuery .html() with a variable allows XSS if the value contains user input. Use .text() or sanitize the input first.',
  },
  {
    name: 'document.write with variable',
    pattern: /document\.write\s*\(\s*(?!['"`])/,
    severity: 'high',
    description: 'document.write with a variable allows XSS if the value contains user input.',
  },
  {
    name: 'eval() usage',
    pattern: /\beval\s*\(\s*(?!['"`])/,
    severity: 'high',
    description: 'eval() with a variable executes arbitrary code. If the argument is user-controlled this is a critical injection risk.',
  },
  {
    name: 'Python render_template_string',
    pattern: /render_template_string\s*\(/,
    severity: 'high',
    description: 'render_template_string with user-controlled input allows Server-Side Template Injection (SSTI), which can escalate beyond XSS.',
  },
  {
    name: 'React dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{/,
    severity: 'medium',
    description: 'dangerouslySetInnerHTML bypasses React XSS protections. Ensure the value is sanitized with DOMPurify or equivalent before use.',
  },
  {
    name: 'Django mark_safe',
    pattern: /mark_safe\s*\(/,
    severity: 'medium',
    description: 'mark_safe bypasses Django auto-escaping. Ensure the content is fully sanitized before being marked safe.',
  },
];

const SCANNABLE = /\.(js|ts|jsx|tsx|php|py|html|ejs|hbs)$/;

function scanXSS(content, filePath) {
  if (!SCANNABLE.test(filePath)) return [];
  if (filePath.includes('.min.')) return [];

  const findings = [];

  for (const rule of XSS_PATTERNS) {
    if (rule.pattern.test(content)) {
      findings.push({
        type: 'xss-vulnerability',
        severity: rule.severity,
        title: `Potential XSS: ${rule.name}`,
        description: rule.description,
        location: filePath,
      });
    }
  }

  return findings;
}

module.exports = { scanXSS };
