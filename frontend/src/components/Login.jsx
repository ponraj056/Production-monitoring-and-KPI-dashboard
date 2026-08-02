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
  <div className="login-container">
    <div className="login-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p className="login-hint">(Mock login: admin@test.com / 1234)</p>
    </div>
  </div>
);
}

export default Login;