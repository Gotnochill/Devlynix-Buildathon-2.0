import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ScanSearch,
  ArrowRight,
  Shield,
  Globe,
  GitFork,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Info,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Simple in-memory scan history (persisted in sessionStorage)         */
/* This reads from the same backend — we just keep a list of IDs      */
/* ------------------------------------------------------------------ */

function getScanHistory() {
  try {
    return JSON.parse(sessionStorage.getItem('vulnscan_history') || '[]');
  } catch {
    return [];
  }
}

export function addToScanHistory(entry) {
  const history = getScanHistory();
  const exists = history.find(h => h.id === entry.id);
  if (!exists) {
    history.unshift(entry);
    sessionStorage.setItem('vulnscan_history', JSON.stringify(history.slice(0, 50)));
  }
}

export function updateScanHistory(id, updates) {
  const history = getScanHistory();
  const idx = history.findIndex(h => h.id === id);
  if (idx !== -1) {
    history[idx] = { ...history[idx], ...updates };
    sessionStorage.setItem('vulnscan_history', JSON.stringify(history));
  }
}

/* ------------------------------------------------------------------ */

const STATUS_CONFIG = {
  queued: { icon: Clock, color: 'var(--muted)', label: 'Queued' },
  running: { icon: Loader2, color: 'var(--accent)', label: 'Running' },
  completed: { icon: CheckCircle2, color: 'var(--low)', label: 'Completed' },
  failed: { icon: XCircle, color: 'var(--critical)', label: 'Failed' },
};

const SEV_ICONS = {
  critical: { icon: ShieldAlert, color: 'var(--critical)' },
  high: { icon: AlertTriangle, color: 'var(--high)' },
  medium: { icon: Info, color: 'var(--medium)' },
  low: { icon: ShieldCheck, color: 'var(--low)' },
};

export default function HomePage() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-xl)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                }}
              >
                <Clock size={18} />
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                }}
              >
                Recent Scans
              </h1>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginLeft: 42 }}>
              View and manage your vulnerability scan history
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/new-scan')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
              cursor: 'pointer',
            }}
          >
            <ScanSearch size={16} />
            New Scan
          </motion.button>
        </div>

        {/* Empty State */}
        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
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
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-xl)',
                background: 'var(--surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted-light)',
              }}
            >
              <Shield size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 4,
                }}
              >
                No scans yet
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Start your first security scan to see results here
              </p>
            </div>
            <Link
              to="/new-scan"
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
                transition: 'all var(--duration) var(--ease)',
              }}
            >
              <ScanSearch size={16} />
              Start Scanning
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* Scan History List */}
        <AnimatePresence>
          {history.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {history.map((entry, i) => {
                const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.queued;
                const StatusIcon = statusCfg.icon;
                const isRunning = entry.status === 'running';

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Link
                      to={`/report/${entry.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div
                        className="card card-interactive"
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          cursor: 'pointer',
                        }}
                      >
                        {/* Type Icon */}
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--surface-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--muted)',
                            flexShrink: 0,
                          }}
                        >
                          {entry.type === 'github' ? (
                            <GitFork size={18} />
                          ) : (
                            <Globe size={18} />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: 'var(--text)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {entry.target}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--muted)',
                              marginTop: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                color: statusCfg.color,
                                fontWeight: 500,
                              }}
                            >
                              <StatusIcon
                                size={12}
                                style={isRunning ? { animation: 'spin 1s linear infinite' } : {}}
                              />
                              {statusCfg.label}
                            </span>
                            {entry.createdAt && (
                              <span>
                                {new Date(entry.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Summary chips */}
                        {entry.summary && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flexShrink: 0,
                            }}
                          >
                            {['critical', 'high', 'medium', 'low'].map(sev => {
                              const count = entry.summary[sev] || 0;
                              if (count === 0) return null;
                              const SevIcon = SEV_ICONS[sev].icon;
                              return (
                                <span
                                  key={sev}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: SEV_ICONS[sev].color,
                                  }}
                                >
                                  <SevIcon size={13} />
                                  {count}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <ArrowRight
                          size={16}
                          style={{ color: 'var(--muted-light)', flexShrink: 0 }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
