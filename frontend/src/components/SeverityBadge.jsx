const STYLES = {
  critical: {
    bg: 'var(--critical-bg)',
    text: 'var(--critical)',
    border: 'var(--critical-border)',
  },
  high: {
    bg: 'var(--high-bg)',
    text: 'var(--high)',
    border: 'var(--high-border)',
  },
  medium: {
    bg: 'var(--medium-bg)',
    text: 'var(--medium)',
    border: 'var(--medium-border)',
  },
  low: {
    bg: 'var(--low-bg)',
    text: 'var(--low)',
    border: 'var(--low-border)',
  },
};

export default function SeverityBadge({ severity }) {
  const s = STYLES[severity] || {
    bg: '#f3f4f6',
    text: '#6b7280',
    border: '#e5e7eb',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius-full)',
        padding: '2px 10px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: s.text,
          marginRight: 6,
          flexShrink: 0,
        }}
      />
      {severity}
    </span>
  );
}
