import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    }
  };

  /**
   * CONCEPT: Rendering Validation Errors
   * The backend returns errors as an object like:
   * { "email": ["This field is required."], "password": ["Too short."] }
   * We need to display these per-field or as a summary.
   */
  const renderErrors = () => {
    if (!error) return null;
    if (typeof error === 'string') {
      return <div className="alert alert-error">{error}</div>;
    }
    return (
      <div className="alert alert-error">
        {Object.entries(error).map(([field, messages]) => (
          <div key={field}>
            <strong>{field}:</strong>{' '}
            {Array.isArray(messages) ? messages.join(', ') : messages}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account 🚀</h2>
        <p className="auth-subtitle">Join TaskManager today</p>
        
        {renderErrors()}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="johndoe"
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
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
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}