import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import GlobalDashboard from './pages/GlobalDashboard';
import GlobalOrders from './pages/GlobalOrders';
import Products from './pages/Products';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce admin privileges
  const allowedRoles = ['super_admin', 'admin', 'restaurant_admin', 'staff', 'manager'];
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 text-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-red-500">Access Restricted</h1>
        <p className="text-gray-400 mb-8 max-w-md">Your active account ({user.email}) does not have administrative privileges for this dashboard.</p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a 
            href="/super-admin/login" 
            onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); }} 
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
          >
            Log In as Super Admin
          </a>
          <a href="/" className="px-6 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all">
            Return to Main Website
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><GlobalDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/global-orders" element={<ProtectedRoute><AppLayout><GlobalOrders /></AppLayout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><AppLayout><Products /></AppLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><AppLayout><Users /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router basename="/super-admin">
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
