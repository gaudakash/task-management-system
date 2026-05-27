/**
 * Navigation Bar Component
 * Shows different content based on auth state.
 * 
 * CONCEPT: Conditional Rendering
 * React renders different UI based on state/props using:
 * - Ternary: {isAuth ? <LogoutBtn/> : <LoginBtn/>}
 * - Short-circuit: {isAuth && <UserInfo/>}
 * - Early return: if (!isAuth) return <LoginBtn/>;
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📋 TaskManager</Link>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <span className="navbar-user">
              👤 {user?.first_name || user?.username}
            </span>
            <Link to="/" className="navbar-link">Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}