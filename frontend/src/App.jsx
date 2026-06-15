import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NewScanPage from './pages/NewScanPage';
import ReportPage from './pages/ReportPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-scan" element={<NewScanPage />} />
        <Route path="/report/:scanId" element={<ReportPage />} />
      </Routes>
    </Layout>
  );
}
