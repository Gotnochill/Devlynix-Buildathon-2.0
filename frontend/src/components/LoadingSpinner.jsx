import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Scanning...', size = 18 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: 'var(--muted)',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: '2.5px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{message}</span>
    </motion.div>
  );
}
