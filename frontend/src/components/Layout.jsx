import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import useTheme from '../hooks/useTheme';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-layout">
      <AnimatePresence>
        <Sidebar
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </AnimatePresence>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
