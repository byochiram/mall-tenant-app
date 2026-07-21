import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import TenantDetail from './pages/TenantDetail';
import TenantForm from './pages/TenantForm';
import Units from './pages/Units';
import Contracts from './pages/Contracts';
import Billing from './pages/Billing';
import Payments from './pages/Payments';
import TenantPortal from './pages/TenantPortal';
import ActivityLog from './pages/ActivityLog';
import { Loading } from './components/UI';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tenants" element={<PrivateRoute><Tenants /></PrivateRoute>} />
      <Route path="/tenants/new" element={<PrivateRoute><TenantForm /></PrivateRoute>} />
      <Route path="/tenants/:id" element={<PrivateRoute><TenantDetail /></PrivateRoute>} />
      <Route path="/tenants/:id/edit" element={<PrivateRoute><TenantForm /></PrivateRoute>} />
      <Route path="/units" element={<PrivateRoute><Units /></PrivateRoute>} />
      <Route path="/contracts" element={<PrivateRoute><Contracts /></PrivateRoute>} />
      <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
      <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
      <Route path="/tenant-portal" element={<PrivateRoute><TenantPortal /></PrivateRoute>} />
      <Route path="/activity-log" element={<PrivateRoute><ActivityLog /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
