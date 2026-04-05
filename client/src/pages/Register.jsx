import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/register', form);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ maxWidth: 400, margin: '5rem auto', padding: '2rem', textAlign: 'center', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12 }}>
      <p style={{ color: 'var(--color-text-success)', fontWeight: 500 }}>{success}</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>
        Please wait for a faculty member to approve your account.
      </p>
      <Link to="/login" style={{ fontSize: 13 }}>Back to Login</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 400, margin: '5rem auto', padding: '2rem', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12 }}>
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 500 }}>Create Account</h2>
      {error && <p style={{ color: 'var(--color-text-danger)', marginBottom: '1rem', fontSize: 13 }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {['name','email','password','department'].map(field => (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{field}</label>
            <input name={field} type={field === 'password' ? 'password' : 'text'}
              value={form[field]} onChange={handleChange}
              style={{ width: '100%', marginTop: 4 }} required />
          </div>
        ))}
        <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: 13, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}