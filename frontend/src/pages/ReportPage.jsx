import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  ShieldAlert,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Activity,
} from 'lucide-react';
import useScan from '../hooks/useScan';
import FindingCard from '../components/FindingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { addToScanHistory, updateScanHistory } from './HomePage';

/* ------------------------------------------------------------------ */
/* Severity card configuration                                         */
/* ------------------------------------------------------------------ */
const SEVERITY_CARDS = [
  {
    key: 'critical',
    label: 'Critical',
    icon: ShieldAlert,
    color: 'var(--critical)',
    bg: 'var(--critical-bg)',
    border: 'var(--critical-border)',
  },
  {
    key: 'high',
    label: 'High',
    icon: AlertTriangle,
    color: 'var(--high)',
    bg: 'var(--high-bg)',
    border: 'var(--high-border)',
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: Info,
    color: 'var(--medium)',
    bg: 'var(--medium-bg)',
    border: 'var(--medium-border)',
  },
  {
    key: 'low',
    label: 'Low',
    icon: ShieldCheck,
    color: 'var(--low)',
    bg: 'var(--low-bg)',
    border: 'var(--low-border)',
  },
];

const STATUS_CONFIG = {
  queued: { icon: Clock, color: 'var(--muted)', label: 'Queued', bg: 'var(--surface-hover)' },
  running: { icon: Loader2, color: 'var(--accent)', label: 'Running', bg: 'var(--accent-light)' },
  completed: { icon: CheckCircle2, color: 'var(--low)', label: 'Completed', bg: 'var(--low-bg)' },
  failed: { icon: XCircle, color: 'var(--critical)', label: 'Failed', bg: 'var(--critical-bg)' },
};

/* ------------------------------------------------------------------ */
/* Animated Counter                                                    */
/* ------------------------------------------------------------------ */
function AnimatedCount({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {value}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* ReportPage                                                          */
/* ------------------------------------------------------------------ */
export default function ReportPage() {
  const { scanId } = useParams();
  const { scan, messages, loading } = useScan(scanId);
  const historyTracked = useRef(false);

  // Track scan in history on first load
  useEffect(() => {
    if (scan && !historyTracked.current) {
      historyTracked.current = true;
      addToScanHistory({
        id: scan.id || scanId,
        target: scan.target,
        type: scan.type,
        status: scan.status,
        createdAt: scan.createdAt,
        summary: scan.summary,
      });
    }
  }, [scan, scanId]);

  // Update history when scan completes
  useEffect(() => {
    if (scan && (scan.status === 'completed' || scan.status === 'failed')) {
      updateScanHistory(scan.id || scanId, {
        status: scan.status,
        summary: scan.summary,
      });
    }
  }, [scan?.status, scan?.summary, scanId]);

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <LoadingSpinner message="Loading scan report..." />
        </div>
      </div>
    );
  }

  /* Not found */
  if (!scan) {
    return (
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{
            padding: 'var(--space-2xl)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted-light)',
            }}
          >
            <FileText size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              Scan not found
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              This scan may have expired or does not exist.
            </p>
          </div>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const isActive = scan.status === 'queued' || scan.status === 'running';
  const statusCfg = STATUS_CONFIG[scan.status] || STATUS_CONFIG.failed;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--muted)',
              fontSize: 13,
              marginBottom: 12,
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color var(--duration) var(--ease)',
            }}
          >
            <ArrowLeft size={14} />
            Back to scans
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                }}
              >
                Scan Report
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontWeight: 600,
                  background: statusCfg.bg,
                  color: statusCfg.color,
                }}
              >
                <StatusIcon
                  size={13}
                  style={
                    scan.status === 'running'
                      ? { animation: 'spin 1s linear infinite' }
                      : {}
                  }
                />
                {statusCfg.label}
              </span>
            </div>

            {scan.status === 'completed' && (
              <motion.a
                href={`/api/report/${scanId}/pdf`}
                download
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                }}
              >
                <Download size={15} />
                Download PDF
              </motion.a>
            )}
          </div>

          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
            {scan.target}
          </p>
        </div>

        {/* Live Progress Bar */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card"
              style={{
                padding: '16px 20px',
                marginBottom: 'var(--space-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderLeft: '3px solid var(--accent)',
              }}
            >
              <Activity size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  {messages[messages.length - 1] || 'Initialising scan...'}
                </div>
                {/* Progress shimmer */}
                <div
                  style={{
                    height: 3,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-hover)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: '40%',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--accent)',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Grid — Severity Summary */}
        {scan.summary && (
          <div className="bento-grid" style={{ marginBottom: 'var(--space-lg)' }}>
            {SEVERITY_CARDS.map((sev, i) => {
              const count = scan.summary[sev.key] ?? 0;
              const SevIcon = sev.icon;

              return (
                <motion.div
                  key={sev.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    borderTop: `3px solid ${sev.color}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: sev.color,
                      }}
                    >
                      {sev.label}
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-md)',
                        background: sev.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: sev.color,
                      }}
                    >
                      <SevIcon size={16} />
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: count > 0 ? sev.color : 'var(--muted-light)',
                      lineHeight: 1,
                    }}
                  >
                    <AnimatedCount value={count} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Total Findings Count */}
        {scan.summary && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 'var(--space-md)',
              paddingBottom: 'var(--space-md)',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <FileText size={16} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              {scan.summary.total} {scan.summary.total === 1 ? 'finding' : 'findings'}
            </span>
          </div>
        )}

        {/* No Findings State */}
        {scan.findings.length === 0 && !isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{
              padding: 'var(--space-2xl)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--low-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--low)',
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                All clear!
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                No vulnerabilities were detected in this scan.
              </p>
            </div>
          </motion.div>
        )}

        {/* Findings List */}
        {scan.findings.map((finding, i) => (
          <FindingCard key={i} finding={finding} index={i} />
        ))}
      </motion.div>
    </div>
  );
}
