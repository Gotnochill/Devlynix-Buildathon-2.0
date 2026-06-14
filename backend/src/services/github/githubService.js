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

// Maps well-known manifest paths to result keys
const MANIFEST_MAP = {
  'requirements.txt':  'requirementsTxt',
  'pyproject.toml':    'pyprojectToml',
  'go.mod':            'goMod',
  'Gemfile':           'gemfile',
  'pom.xml':           'pomXml',
  'Cargo.toml':        'cargoToml',
  'composer.json':     'composerJson',
};

const SCANNABLE = /\.(js|ts|jsx|tsx|py|env|json|yml|yaml|sh|php|rb|go|java|cs)$/;

async function fetchRepoData(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const tree = await getRepoTree(owner, repo);

  const blobs = tree.filter(f => f.type === 'blob');
  const result = { owner, repo, files: [], packageJson: null, manifests: {} };

  // Fetch package.json
  const pkgFile = blobs.find(f => f.path === 'package.json');
  if (pkgFile) {
    try {
      const content = await getFileContent(owner, repo, 'package.json');
      result.packageJson = JSON.parse(content);
    } catch { /* malformed — skip */ }
  }

  // Fetch all other known manifest files (root-level only)
  await Promise.allSettled(
    Object.entries(MANIFEST_MAP).map(async ([filename, key]) => {
      const found = blobs.find(f => f.path === filename || f.path.endsWith(`/${filename}`));
      if (!found) return;
      try {
        result.manifests[key] = await getFileContent(owner, repo, found.path);
      } catch { /* skip */ }
    })
  );

  // Fetch scannable source files for secret scanning (limit 50)
  const scannable = blobs.filter(f => SCANNABLE.test(f.path)).slice(0, 50);
  await Promise.allSettled(
    scannable.map(async file => {
      try {
        const content = await getFileContent(owner, repo, file.path);
        result.files.push({ path: file.path, content });
      } catch { /* skip */ }
    })
  );

  return result;
}

module.exports = { fetchRepoData };
