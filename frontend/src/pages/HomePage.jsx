import ScanForm from '../components/ScanForm';

const FEATURES = [
  {
    tag: 'URL scan',
    title: 'Security Headers',
    description: 'Checks for missing HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy. Also flags server version disclosure.',
  },
  {
    tag: 'Repo scan',
    title: 'Exposed Secrets',
    description: 'Scans every source file for AWS keys, GitHub tokens, private key blocks, MongoDB URIs, Slack tokens, and hardcoded passwords.',
  },
  {
    tag: 'Repo scan',
    title: 'CVE Detection',
    description: 'Parses npm, PyPI, Go, Ruby, Maven, Cargo, and Composer manifests and checks each package against the GitHub Advisory Database and Red Hat CVE API.',
    wide: true,
  },
  {
    tag: 'AI powered',
    title: 'Code Analysis',
    description: 'Claude Haiku reviews source files for injection flaws, broken auth, SSRF, path traversal, and logic vulnerabilities that regex cannot catch.',
    wide: true,
  },
];

function Tag({ label }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--accent-light)',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '2px 7px',
      marginBottom: 8,
    }}>
      {label}
    </span>
  );
}

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
    }}>
      <div style={{ marginBottom: 10, textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-light)',
          marginBottom: 14,
        }}>
          Track 2 — Cybersecurity Tooling
        </div>
        <h1 style={{
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          marginBottom: 10,
        }}>
          VulnScan
        </h1>
        <p style={{
          color: 'var(--muted)',
          fontSize: 14,
          maxWidth: 460,
          lineHeight: 1.7,
        }}>
          Developers often push code without checking basic security misconfigurations.
          Submit a URL or GitHub repo to get a risk classification report before it reaches production.
        </p>
      </div>

      <div style={{ margin: '28px 0 32px', width: '100%', maxWidth: 600 }}>
        <ScanForm />
      </div>

      <div className="bento-grid">
        {FEATURES.map(f => (
          <div key={f.title} className={`bento-card${f.wide ? ' wide' : ''}`}>
            <Tag label={f.tag} />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: 'var(--text)' }}>
              {f.title}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
