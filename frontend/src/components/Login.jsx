import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from './AnimatedBackground';

function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleAdminMode = (e) => {
    e.preventDefault();
    if (!isAdminMode) {
      setIdentifier('admin');
      setPassword('');
    } else {
      setIdentifier('');
      setPassword('');
    }
    setIsAdminMode(!isAdminMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      login(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username/email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <div className="login-container">
      <div className="login-card">
        <h2>{isAdminMode ? 'Admin Login' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          {!isAdminMode ? (
            <input
              type="text"
              placeholder="Username or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          ) : (
            <div style={{ padding: '12px', background: 'var(--surface-light)', borderRadius: '4px', marginBottom: '15px', color: 'var(--text-muted)' }}>
              Logging in as: <strong>Administrator</strong>
            </div>
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
            <button 
              type="button" 
              onClick={toggleAdminMode}
              style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', padding: 0 }}
            >
              {isAdminMode ? 'Standard Login' : 'Admin Login'}
            </button>
            <Link to="/forgot-password" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Forgot Password?</Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
          <p className="login-hint">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </AnimatedBackground>
  );
}

export default Login;