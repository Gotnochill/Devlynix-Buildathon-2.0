import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Globe, GitFork, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const TYPES = [
  { id: 'url', label: 'Website URL', icon: Globe, placeholder: 'https://example.com' },
  { id: 'github', label: 'GitHub Repo', icon: GitFork, placeholder: 'https://github.com/owner/repo' },
];

export default function ScanForm() {
  const [target, setTarget] = useState('');
  const [type, setType] = useState('url');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const activeType = TYPES.find(t => t.id === type);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/scan', { target, type });
      navigate(`/report/${data.scanId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start scan. Is the backend running?');
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{ width: '100%', maxWidth: 560 }}
    >
      {/* Segmented Control */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 'var(--space-md)',
          background: 'var(--surface-hover)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          position: 'relative',
        }}
      >
        {TYPES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              background: type === t.id ? 'var(--surface)' : 'transparent',
              color: type === t.id ? 'var(--text)' : 'var(--muted)',
              fontWeight: type === t.id ? 600 : 400,
              fontSize: 13,
              border: 'none',
              boxShadow: type === t.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--duration) var(--ease)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <t.icon size={16} strokeWidth={type === t.id ? 2.2 : 1.8} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Input + Button */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          alignItems: 'stretch',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            id="scan-target-input"
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder={activeType.placeholder}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text)',
              fontSize: 14,
              fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1,
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 24px',
            background: loading
              ? 'var(--muted-light)'
              : 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            boxShadow: loading
              ? 'none'
              : '0 2px 8px rgba(99, 102, 241, 0.25)',
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all var(--duration) var(--ease)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Scanning...
            </>
          ) : (
            <>
              Start Scan
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 'var(--space-sm)',
              padding: '10px 14px',
              background: 'var(--critical-bg)',
              border: '1px solid var(--critical-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--critical)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
