import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportDetailPage from './pages/ReportDetailPage';
import MapViewPage from './pages/MapViewPage';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-zinc-950 text-white selection:bg-blue-500/30 selection:text-blue-200">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ResidentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/report/:id" element={<ReportDetailPage />} />
            <Route path="/map" element={<MapViewPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
