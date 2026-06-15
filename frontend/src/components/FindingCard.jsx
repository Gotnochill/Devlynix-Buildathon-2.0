import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, FileCode2, Bug } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function FindingCard({ finding, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="card"
      style={{
        padding: 0,
        marginBottom: 'var(--space-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(prev => !prev)}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
        }}
      >
        <SeverityBadge severity={finding.severity} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {finding.title}
          </div>
        </div>

        {finding.location && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--muted)',
              background: 'var(--surface-hover)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <FileCode2 size={12} strokeWidth={1.8} />
            <span>{finding.location}</span>
          </div>
        )}

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, color: 'var(--muted-light)' }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

      {/* Expandable Details */}
      <motion.div
        initial={false}
        animate={{
          height: expanded ? 'auto' : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            padding: '0 16px 14px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: 14,
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 13,
              lineHeight: 1.7,
              marginBottom: finding.cveId ? 10 : 0,
            }}
          >
            {finding.description}
          </p>

          {finding.cveId && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--accent)',
                background: 'var(--accent-light)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
              }}
            >
              <Bug size={12} />
              <span>{finding.cveId}</span>
              {finding.score && (
                <span
                  style={{
                    color: 'var(--muted)',
                    marginLeft: 4,
                  }}
                >
                  CVSS {finding.score}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
