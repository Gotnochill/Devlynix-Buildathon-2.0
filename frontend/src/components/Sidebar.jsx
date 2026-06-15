import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  ScanSearch,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/new-scan', icon: ScanSearch, label: 'New Scan' },
  { to: '/', icon: Clock, label: 'Recent Scans' },
];

export default function Sidebar({ collapsed, onToggle, theme, onToggleTheme }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <motion.div
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 40,
            display: 'none',
          }}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          background: 'var(--bg-alt)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Shield size={18} color="#fff" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text)',
                  letterSpacing: '-0.02em',
                }}
              >
                VulnScan
              </motion.span>
            )}
          </NavLink>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggle}
            className="sidebar-desktop-btn"
            aria-label="Toggle sidebar"
            style={{
              position: 'absolute',
              right: -12,
              top: 29,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 60,
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile close button — visible only on small screens via CSS */}
          <button
            onClick={onToggle}
            className="sidebar-close-btn"
            aria-label="Close sidebar"
            style={{
              display: 'none',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--muted-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '8px 8px 6px',
              opacity: collapsed ? 0 : 1,
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            Scanner
          </div>

          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => {
                  if (window.innerWidth < 769) onToggle?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: 2,
                  transition: 'all var(--duration) var(--ease)',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-light)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'relative', whiteSpace: 'nowrap' }}
                  >
                    {label}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '12px 12px 16px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted-light)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              paddingLeft: collapsed ? 0 : 8,
              justifyContent: collapsed ? 'center' : 'flex-start',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Shield size={12} style={{ flexShrink: 0 }} />
            {!collapsed && <span>VulnScan v1.0</span>}
          </div>

          <motion.button
            onClick={onToggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              cursor: 'pointer',
              transition: 'all var(--duration) var(--ease)',
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="sidebar-mobile-btn"
        aria-label="Open sidebar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 45,
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        <Menu size={20} />
      </button>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
          .sidebar-mobile-btn { display: flex !important; }
          .sidebar-desktop-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
