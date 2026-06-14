const STYLES = {
  critical: { bg: '#2d1515', text: '#e87070', border: '#b91c1c' },
  high:     { bg: '#2d1c12', text: '#e87f4a', border: '#c2540a' },
  medium:   { bg: '#2d2512', text: '#d4a040', border: '#b45309' },
  low:      { bg: '#152215', text: '#5dba7e', border: '#3d8c5c' },
};

export default function SeverityBadge({ severity }) {
  const s = STYLES[severity] || { bg: '#1c2620', text: '#7d9485', border: '#253022' };
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
