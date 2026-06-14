import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report/:scanId" element={<ReportPage />} />
      </Routes>
    </AuthProvider>
  );
}
