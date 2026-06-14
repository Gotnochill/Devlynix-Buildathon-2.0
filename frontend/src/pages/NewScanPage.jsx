import { motion } from 'framer-motion';
import { ScanSearch, ShieldCheck, Lock, Package } from 'lucide-react';
import ScanForm from '../components/ScanForm';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Security Headers',
    desc: 'Detect missing HTTP security headers on any URL',
    color: 'var(--accent)',
    bg: 'var(--accent-light)',
  },
  {
    icon: Lock,
    title: 'Secret Detection',
    desc: 'Find exposed API keys, tokens, and credentials',
    color: 'var(--critical)',
    bg: 'var(--critical-bg)',
  },
  {
    icon: Package,
    title: 'Dependency Audit',
    desc: 'Check npm packages against NVD for known CVEs',
    color: 'var(--medium)',
    bg: 'var(--medium-bg)',
  },
];

export default function NewScanPage() {
  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
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
              <ScanSearch size={18} />
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
              }}
            >
              New Scan
            </h1>
          </div>
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 14,
              marginLeft: 42,
            }}
          >
            Enter a website URL or GitHub repository to scan for vulnerabilities
          </p>
        </div>

        {/* Scan Form Card */}
        <div
          className="card"
          style={{
            padding: 'var(--space-xl)',
            maxWidth: 640,
          }}
        >
          <ScanForm />
        </div>

        {/* Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-2xl)',
            maxWidth: 640,
          }}
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
              className="card"
              style={{
                padding: 'var(--space-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: feat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: feat.color,
                }}
              >
                <feat.icon size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 2,
                  }}
                >
                  {feat.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--muted)',
                    lineHeight: 1.5,
                  }}
                >
                  {feat.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
