import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TYPES = [
  { id: 'url', label: 'URL Scan', placeholder: 'https://example.com' },
  { id: 'github', label: 'GitHub Repo', placeholder: 'https://github.com/owner/repo' },
];

export default function ScanForm() {
  const [target, setTarget] = useState('');
  const [type, setType] = useState('url');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const placeholder = TYPES.find(t => t.id === type).placeholder;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/scan', { target, type });
      navigate(`/report/${data.scanId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start scan');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 560 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {TYPES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            style={{
              padding: '7px 18px',
              borderRadius: 6,
              background: type === t.id ? 'var(--accent)' : 'var(--surface)',
              color: type === t.id ? '#fff' : 'var(--muted)',
              border: `1px solid ${type === t.id ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder={placeholder}
          required
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text)',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 22px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 6,
            fontWeight: 600,
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? 'Starting...' : 'Scan'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--critical)', marginTop: 8, fontSize: 13 }}>{error}</p>
      )}
    </form>
  );
}
