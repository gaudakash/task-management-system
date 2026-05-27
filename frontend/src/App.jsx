/**
 * App Component — Root of the React application.
 * 
 * CONCEPT: React Router (Client-Side Routing)
 * Traditional websites: Each URL loads a new HTML page from the server.
 * Single Page App (SPA): ONE HTML page is loaded initially, then React Router
 * handles URL changes by swapping components IN THE BROWSER — no server roundtrip!
 * 
 * This makes navigation instant and enables a smoother user experience.
 * 
 * CONCEPT: Protected Routes
 * Some pages (Dashboard) should only be accessible to logged-in users.
 * If not authenticated, redirect to /login.
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

/**
 * ProtectedRoute — Wrapper that redirects unauthenticated users to login.
 * 
 * CONCEPT: Higher-Order Component Pattern
 * This wraps around child components and adds authentication checking.
 * If not authenticated → Navigate to /login
 * If authenticated → render the child component
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * PublicRoute — Redirects authenticated users away from login/register.
 * If already logged in and visiting /login, redirect to dashboard.
 */
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all: redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

/**
 * CONCEPT: Provider Pattern
 * AuthProvider wraps the entire app, making auth state available
 * to ALL components via useAuth() hook.
 * 
 * Component Tree:
 * AuthProvider → Router → Navbar + Routes → Pages → Components
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;