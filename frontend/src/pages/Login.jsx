/**
 * Login Page Component
 * 
 * CONCEPT: Controlled Components (React Forms)
 * In React, form inputs can be "controlled" — their value is driven by React state.
 * When user types, onChange updates state → state updates the input's value.
 * This gives React full control over the form data.
 * 
 * Flow: User types → onChange fires → setState → React re-renders → input shows new value
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  // CONCEPT: useState hook — declares a state variable
  // Returns [currentValue, setterFunction]
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // CONCEPT: Computed property names [e.target.name]
  // This single handler works for ALL inputs by using the input's 'name' attribute
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    // CONCEPT: preventDefault() stops the form from doing a traditional
    // full-page POST request. We handle submission with JavaScript instead.
    e.preventDefault();
    
    const result = await login(formData);
    if (result.success) {
      navigate('/');  // Redirect to dashboard on success
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back 👋</h2>
        <p className="auth-subtitle">Login to manage your tasks</p>
        
        {/* CONCEPT: Error State Handling */}
        {error && (
          <div className="alert alert-error">
            {typeof error === 'string' ? error : 'Login failed. Please try again.'}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          
          {/* CONCEPT: Loading State — disable button during API call */}
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}