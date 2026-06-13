export default function LoadingSpinner({ message = 'Scanning...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)' }}>
      <div style={{
        width: 16,
        height: 16,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 13 }}>{message}</span>
    </div>
  );
}
