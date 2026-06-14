import { useAuth } from '../context/AuthContext';

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function LoginButton() {
  const { user, logout } = useAuth();

  if (user === undefined) return null;

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user.avatar && (
          <img
            src={user.avatar}
            alt={user.username}
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)' }}
          />
        )}
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{user.username}</span>
        <button
          onClick={logout}
          style={{
            fontSize: 12,
            color: 'var(--muted)',
            background: 'none',
            border: '1px solid var(--border)',
            padding: '4px 12px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <a
      href="/auth/github"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: '#24292e',
        color: '#fff',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
        border: '1px solid #444',
      }}
    >
      <GitHubIcon />
      Login with GitHub
    </a>
  );
}
