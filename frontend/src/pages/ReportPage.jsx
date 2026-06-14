import { useParams, Link } from 'react-router-dom';
import useScan from '../hooks/useScan';
import FindingCard from '../components/FindingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SeverityBadge from '../components/SeverityBadge';

const STATUS_STYLE = {
  queued:    { bg: '#172419', text: '#52b788', border: '#3a6147' },
  running:   { bg: '#172419', text: '#52b788', border: '#3a6147' },
  completed: { bg: '#152215', text: '#5dba7e', border: '#3d8c5c' },
  failed:    { bg: '#2a1515', text: '#e87070', border: '#b91c1c' },
};

const SEV_ORDER = ['critical', 'high', 'medium', 'low'];

export default function ReportPage() {
  const { scanId } = useParams();
  const { scan, messages, loading } = useScan(scanId);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <LoadingSpinner message="Loading scan..." />
      </div>
    );
  }

  if (!scan) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Scan not found.</p>
        <Link to="/">Back to scanner</Link>
      </div>
    );
  }

  const isActive = scan.status === 'queued' || scan.status === 'running';
  const ss = STATUS_STYLE[scan.status] || STATUS_STYLE.failed;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link to="/" style={{ color: 'var(--muted)', fontSize: 13 }}>Back</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Scan Report</h1>
          <span style={{
            padding: '2px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background: ss.bg,
            color: ss.text,
            border: `1px solid ${ss.border}`,
          }}>
            {scan.status}
          </span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{scan.target}</p>
      </div>

      {/* Live progress */}
      {isActive && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <LoadingSpinner message={messages[messages.length - 1] || 'Initialising...'} />
        </div>
      )}

      {/* Bento summary */}
      {scan.summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 10,
          marginBottom: 24,
        }}>
          {SEV_ORDER.map((sev, i) => {
            const count = scan.summary[sev] ?? 0;
            const isCritical = sev === 'critical';
            return (
              <div key={sev} style={{
                background: 'var(--surface)',
                border: `1px solid ${count > 0 && isCritical ? '#b91c1c' : 'var(--border)'}`,
                borderRadius: 10,
                padding: isCritical ? '20px 18px' : '14px 12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  fontSize: isCritical ? 40 : 28,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: 8,
                  color: count > 0
                    ? { critical: '#e87070', high: '#e87f4a', medium: '#d4a040', low: '#5dba7e' }[sev]
                    : 'var(--muted)',
                }}>
                  {count}
                </div>
                <SeverityBadge severity={sev} />
              </div>
            );
          })}
        </div>
      )}

      {/* Download */}
      {scan.status === 'completed' && (
        <div style={{ marginBottom: 20 }}>
          <a
            href={`/api/report/${scanId}/pdf`}
            download
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Download PDF Report
          </a>
        </div>
      )}

      {/* Findings */}
      {scan.findings.length === 0 && !isActive && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '32px 20px',
          textAlign: 'center',
          color: 'var(--muted)',
        }}>
          No findings detected.
        </div>
      )}
      {scan.findings.map((finding, i) => (
        <FindingCard key={i} finding={finding} />
      ))}
    </div>
  );
}
