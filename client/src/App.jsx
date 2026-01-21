import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/Dashboard';
import AgentDashboard from './pages/agent/Dashboard';
import MainLayout from './components/layout/MainLayout';
import axios from 'axios';
import AdminDashboard from './components/Dashboard/AdminDashboard';
axios.defaults.baseURL = 'http://localhost:5173'; // Or your server port

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:role/login" element={<LoginPage />} />
        <Route path="/:role/register" element={<RegisterPage />} />
        <Route path="/student/dashboard" element={<ProtectedRoute><MainLayout><StudentDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/agent/dashboard" element={<ProtectedRoute><MainLayout><AgentDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;