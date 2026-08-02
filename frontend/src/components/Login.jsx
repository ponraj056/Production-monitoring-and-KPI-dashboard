import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // MOCK LOGIN: replace this with a real API call later
    if (email === 'admin@test.com' && password === '1234') {
      const fakeToken = 'mock-jwt-token-abc123';
      onLogin(fakeToken);
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '8px' }}>
          Login
        </button>
      </form>
      <p style={{ fontSize: '12px', color: '#888' }}>
        (Mock login: admin@test.com / 1234)
      </p>
    </div>
  );
}

export default Login;