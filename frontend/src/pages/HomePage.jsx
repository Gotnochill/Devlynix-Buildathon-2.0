import ScanForm from '../components/ScanForm';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          VulnScan
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          Security scanner for URLs and GitHub repositories
        </p>
      </div>
      <ScanForm />
    </div>
  );
}
