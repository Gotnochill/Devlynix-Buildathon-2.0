// Parses dependency manifests from multiple ecosystems into a flat
// [{ name, version, ecosystem }] array for CVE lookup.

function parsePackageJson(pkg) {
  return Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })
    .map(([name, version]) => ({ name, version, ecosystem: 'npm' }));
}

function parseRequirementsTxt(content) {
  return content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('-r') && !l.startsWith('--'))
    .map(l => {
      // Strip extras like requests[security]==2.28.0 or flask>=1.0,<2.0
      const nameMatch = l.match(/^([A-Za-z0-9_\-\.]+)/);
      if (!nameMatch) return null;
      const versionMatch = l.match(/[=<>!~]+\s*([^\s,;]+)/);
      return { name: nameMatch[1], version: versionMatch ? versionMatch[1] : '*', ecosystem: 'pypi' };
    })
    .filter(Boolean);
}

function parsePyprojectToml(content) {
  const results = [];
  // Handles both [tool.poetry.dependencies] and [project] dependencies = [...] styles
  const poetryBlock = content.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(?=\[|$)/);
  if (poetryBlock) {
    for (const line of poetryBlock[1].split('\n')) {
      const m = line.match(/^\s*([a-zA-Z0-9_\-]+)\s*=\s*"?([^"#\n]+)"?/);
      if (m && m[1] !== 'python') {
        results.push({ name: m[1], version: m[2].trim(), ecosystem: 'pypi' });
      }
    }
  }
  const projectDeps = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (projectDeps) {
    for (const m of projectDeps[1].matchAll(/"([A-Za-z0-9_\-\.]+)([><=!~,\s][^"]*)?"/g)) {
      results.push({ name: m[1], version: m[2]?.trim() || '*', ecosystem: 'pypi' });
    }
  }
  return results;
}

function parseGoMod(content) {
  const results = [];
  const block = content.match(/require\s*\(([\s\S]*?)\)/);
  const lines = block ? block[1].split('\n') : [];
  for (const line of lines) {
    const m = line.trim().match(/^([^\s/][^\s]*)\s+(v[\w.\-+]+)/);
    if (m) results.push({ name: m[1], version: m[2], ecosystem: 'go' });
  }
  // Single-line requires outside a block
  for (const m of content.matchAll(/^require\s+(\S+)\s+(v[\w.\-+]+)/gm)) {
    results.push({ name: m[1], version: m[2], ecosystem: 'go' });
  }
  return results;
}

function parseGemfile(content) {
  const results = [];
  for (const m of content.matchAll(/^\s*gem\s+['"]([^'"]+)['"](.*)/gm)) {
    const versionMatch = m[2].match(/['"]([~><=\s\d.,]+)['"]/);
    results.push({ name: m[1], version: versionMatch ? versionMatch[1].trim() : '*', ecosystem: 'gem' });
  }
  return results;
}

function parsePomXml(content) {
  const results = [];
  for (const block of content.matchAll(/<dependency>([\s\S]*?)<\/dependency>/g)) {
    const groupId = block[1].match(/<groupId>([^<]+)<\/groupId>/)?.[1];
    const artifactId = block[1].match(/<artifactId>([^<]+)<\/artifactId>/)?.[1];
    const version = block[1].match(/<version>([^<]+)<\/version>/)?.[1];
    if (artifactId) {
      results.push({
        name: groupId ? `${groupId}:${artifactId}` : artifactId,
        version: version || '*',
        ecosystem: 'maven',
      });
    }
  }
  return results;
}

function parseCargoToml(content) {
  const results = [];
  const section = content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
  if (!section) return results;
  for (const line of section[1].split('\n')) {
    const nameMatch = line.match(/^\s*([a-zA-Z0-9_\-]+)\s*=/);
    if (!nameMatch) continue;
    const versionMatch = line.match(/version\s*=\s*"([^"]+)"/) || line.match(/=\s*"([^"]+)"/);
    results.push({ name: nameMatch[1], version: versionMatch ? versionMatch[1] : '*', ecosystem: 'cargo' });
  }
  return results;
}

function parseComposerJson(pkg) {
  return Object.entries({ ...pkg.require, ...pkg['require-dev'] })
    .filter(([name]) => name !== 'php' && !name.startsWith('ext-'))
    .map(([name, version]) => ({ name, version, ecosystem: 'composer' }));
}

function extractAllDeps(repoData) {
  const all = [];
  const { packageJson, manifests = {} } = repoData;

  if (packageJson)            all.push(...parsePackageJson(packageJson));
  if (manifests.requirementsTxt) all.push(...parseRequirementsTxt(manifests.requirementsTxt));
  if (manifests.pyprojectToml)   all.push(...parsePyprojectToml(manifests.pyprojectToml));
  if (manifests.goMod)           all.push(...parseGoMod(manifests.goMod));
  if (manifests.gemfile)         all.push(...parseGemfile(manifests.gemfile));
  if (manifests.pomXml)          all.push(...parsePomXml(manifests.pomXml));
  if (manifests.cargoToml)       all.push(...parseCargoToml(manifests.cargoToml));
  if (manifests.composerJson) {
    try {
      const parsed = typeof manifests.composerJson === 'string'
        ? JSON.parse(manifests.composerJson)
        : manifests.composerJson;
      all.push(...parseComposerJson(parsed));
    } catch { /* malformed composer.json */ }
  }

  return all;
}

module.exports = { extractAllDeps };
