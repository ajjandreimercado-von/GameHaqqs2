import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GamesLibrary } from './pages/GamesLibrary';
import { GameDetail } from './pages/GameDetail';
import { UserProfile } from './pages/UserProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { Settings } from './pages/Settings';
import { TipsPage } from './pages/TipsPage';
import { WikiPage } from './pages/WikiPage';
import './styles/globals.css';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isInitialized } = useAuth();

  // Wait for auth to initialize before redirecting
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b2838]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#66c0f4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8f98a0]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'moderator') return <Navigate to="/moderator" replace />;
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isInitialized } = useAuth();

  // Wait for auth to initialize
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b2838]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#66c0f4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8f98a0]">Loading...</p>
        </div>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'moderator') return '/moderator';
    return '/games';
  };

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to={getDefaultRoute()} replace /> : <LandingPage />} />
        <Route path="/index.html" element={user ? <Navigate to={getDefaultRoute()} replace /> : <LandingPage />} />
        <Route path="/preview_page.html" element={user ? <Navigate to={getDefaultRoute()} replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />} />
        <Route
          path="/games"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <GamesLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:id"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <GameDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Navigate to="/profile" replace />
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderator"
          element={
            <ProtectedRoute allowedRoles={['moderator']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tips"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <TipsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wiki"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <WikiPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="dark min-h-screen">
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
