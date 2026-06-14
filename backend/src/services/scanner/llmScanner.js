const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const CODE_EXTENSIONS = /\.(js|ts|jsx|tsx|py|php|rb|go|java|cs|sh|bash)$/;

function batchFiles(files, maxChars = 24000) {
  const batches = [];
  let batch = [], size = 0;

  for (const file of files) {
    // Truncate large files and skip minified ones
    const snippet = `// ${file.path}\n${file.content.slice(0, 2500)}`;
    if (size + snippet.length > maxChars && batch.length > 0) {
      batches.push(batch);
      batch = [];
      size = 0;
    }
    batch.push({ path: file.path, snippet });
    size += snippet.length;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

async function scanWithLLM(files) {
  const llm = getClient();
  if (!llm) return [];

  const scannable = files.filter(f =>
    CODE_EXTENSIONS.test(f.path) &&
    !f.path.includes('.min.') &&
    !f.path.includes('node_modules')
  );

  if (!scannable.length) return [];

  const batches = batchFiles(scannable);
  const allFindings = [];

  for (const batch of batches) {
    const code = batch.map(f => f.snippet).join('\n\n---\n\n');

    try {
      const msg = await llm.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: 'You are a security code reviewer. Respond ONLY with valid JSON. No markdown, no explanation.',
        messages: [{
          role: 'user',
          content: `Find HIGH and CRITICAL security vulnerabilities in this code.

Check for: XSS, SQL/NoSQL injection, command injection, path traversal, SSRF, CSRF,
broken authentication, missing authorization, insecure crypto, prototype pollution,
hardcoded secrets, open redirects, insecure deserialization.

Only report real, exploitable issues. Skip low-severity or theoretical ones.

Respond with ONLY this JSON:
{"findings":[{"severity":"critical|high","title":"short title","description":"what it is and how to fix it","location":"filename:line-or-function"}]}

If no issues found: {"findings":[]}

Code:
${code}`,
        }],
      });

      const text = msg.content[0]?.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) continue;

      const parsed = JSON.parse(match[0]);
      for (const f of parsed.findings || []) {
        allFindings.push({
          type: 'code-vulnerability',
          severity: ['critical', 'high'].includes(f.severity) ? f.severity : 'high',
          title: f.title,
          description: f.description,
          location: f.location || 'unknown',
          source: 'llm',
        });
      }
    } catch {
      // skip batch on parse or API error
    }
  }

  return allFindings;
}

module.exports = { scanWithLLM };
