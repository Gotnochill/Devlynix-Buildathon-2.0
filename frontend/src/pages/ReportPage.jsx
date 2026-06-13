import { useParams, Link } from 'react-router-dom';
import useScan from '../hooks/useScan';
import FindingCard from '../components/FindingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SeverityBadge from '../components/SeverityBadge';

const STATUS_STYLE = {
  queued:    { bg: '#1a2535', text: '#7dd3fc', border: '#0369a1' },
  running:   { bg: '#1a2535', text: '#7dd3fc', border: '#0369a1' },
  completed: { bg: '#162416', text: '#86efac', border: '#166534' },
  failed:    { bg: '#2a1515', text: '#f87171', border: '#991b1b' },
};

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
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: 'var(--muted)', fontSize: 13 }}>← Back</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Scan Report</h1>
          <span style={{
            padding: '2px 10px',
            borderRadius: 20,
            fontSize: 12,
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

      {/* Summary tiles */}
      {scan.summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}>
          {['critical', 'high', 'medium', 'low'].map(sev => (
            <div key={sev} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '14px 10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 6 }}>
                {scan.summary[sev] ?? 0}
              </div>
              <SeverityBadge severity={sev} />
            </div>
          ))}
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
        <p style={{ color: 'var(--muted)', padding: '16px 0' }}>No findings detected.</p>
      )}
      {scan.findings.map((finding, i) => (
        <FindingCard key={i} finding={finding} />
      ))}
    </div>
  );
}
