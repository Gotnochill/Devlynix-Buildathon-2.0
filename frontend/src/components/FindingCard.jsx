import SeverityBadge from './SeverityBadge';

export default function FindingCard({ finding }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '14px 16px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <SeverityBadge severity={finding.severity} />
        <span style={{ fontWeight: 500, fontSize: 14 }}>{finding.title}</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>
        {finding.description}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {finding.location && (
          <code style={{
            fontSize: 12,
            color: '#7dd3fc',
            background: '#0c1f30',
            padding: '2px 7px',
            borderRadius: 3,
          }}>
            {finding.location}
          </code>
        )}
        {finding.cveId && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {finding.cveId}{finding.score ? ` — CVSS ${finding.score}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
