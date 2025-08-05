import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PublicRegister from './components/Auth/PublicRegister';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Home from './components/Dashboard/Home';
import AdminPanel from './components/Dashboard/AdminPanel';
import TransactionHistory from './components/Dashboard/TransactionHistory';
import UserProfile from './components/Dashboard/UserProfile';
import ChecksHistory from './components/Dashboard/ChecksHistory';
import TopUpBalance from './components/Payment/TopUpBalance';
import Navbar from './components/Navbar';
import PublicHome from './components/PublicHome';
import IrishHistoryCheck from './components/Services/IrishHistoryCheck';
import Valuation from './components/Services/Valuation';
import VINChecker from './components/Services/VINChecker';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <Navbar />
          <Routes>
            {/* Public Routes - accessible without login */}
            <Route path="/" element={<PublicHome />} />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <PublicRegister />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            
            {/* Private Routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/irish-history-check"
              element={
                <PrivateRoute>
                  <IrishHistoryCheck />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/valuation"
              element={
                <PrivateRoute>
                  <Valuation />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/vin-checker"
              element={
                <PrivateRoute>
                  <VINChecker />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <TransactionHistory />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/checks-history"
              element={
                <PrivateRoute>
                  <ChecksHistory />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/top-up"
              element={
                <PrivateRoute>
                  <TopUpBalance />
                </PrivateRoute>
              }
            />
            
            {/* Admin Only Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/create-user"
              element={
                <PrivateRoute adminOnly>
                  <Register />
                </PrivateRoute>
              }
            />
            
            {/* Catch all route - redirect to public home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
