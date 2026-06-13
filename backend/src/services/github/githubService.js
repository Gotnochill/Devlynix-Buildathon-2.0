const axios = require('axios');

function getHeaders() {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function parseRepoUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

async function getRepoTree(owner, repo) {
  const res = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers: getHeaders(), timeout: 15000 }
  );
  return res.data.tree || [];
}

async function getFileContent(owner, repo, path) {
  const res = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { headers: getHeaders(), timeout: 10000 }
  );
  return Buffer.from(res.data.content, 'base64').toString('utf-8');
}

const SCANNABLE = /\.(js|ts|jsx|tsx|py|env|json|yml|yaml|sh|php|rb|go|java|cs)$/;

async function fetchRepoData(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const tree = await getRepoTree(owner, repo);

  const blobs = tree.filter(f => f.type === 'blob');
  const result = { owner, repo, files: [], packageJson: null };

  const pkgFile = blobs.find(f => f.path === 'package.json');
  if (pkgFile) {
    try {
      const content = await getFileContent(owner, repo, 'package.json');
      result.packageJson = JSON.parse(content);
    } catch {
      // malformed package.json — skip dep scan
    }
  }

  // Limit to 50 files to stay within GitHub rate limits
  const scannable = blobs.filter(f => SCANNABLE.test(f.path)).slice(0, 50);

  await Promise.allSettled(
    scannable.map(async file => {
      try {
        const content = await getFileContent(owner, repo, file.path);
        result.files.push({ path: file.path, content });
      } catch {
        // skip unreadable files
      }
    })
  );

  return result;
}

module.exports = { fetchRepoData };
