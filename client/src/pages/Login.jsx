import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '5rem auto', padding: '2rem', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12 }}>
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 500 }}>Login to CampusHUB</h2>
      {error && <p style={{ color: 'var(--color-text-danger)', marginBottom: '1rem', fontSize: 13 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', marginTop: 4 }} required />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', marginTop: 4 }} required />
        </div>
        <button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: 13, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}