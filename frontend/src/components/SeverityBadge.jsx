const STYLES = {
  critical: { bg: '#3f1515', text: '#f87171', border: '#dc2626' },
  high:     { bg: '#3f2015', text: '#fb923c', border: '#ea580c' },
  medium:   { bg: '#3f3015', text: '#fbbf24', border: '#d97706' },
  low:      { bg: '#1a2f15', text: '#86efac', border: '#65a30d' },
};

export default function SeverityBadge({ severity }) {
  const s = STYLES[severity] || { bg: '#1e293b', text: '#94a3b8', border: '#475569' };
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      border: `1px solid ${s.border}`,
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {severity}
    </span>
  );
}
