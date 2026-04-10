import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (!form.department.trim()) return 'Department is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/register', form);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="animate-fadeInUp" style={{
        width: '100%', maxWidth: 420, textAlign: 'center',
        background: 'var(--gradient-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem', fontSize: 24,
        }}>✓</div>
        <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-success)', marginBottom: 8 }}>{success}</p>
        <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          A faculty member will review your application. You'll be able to log in once approved.
        </p>
        <Link to="/login" style={{ fontSize: 13, fontWeight: 500 }}>← Back to Login</Link>
      </div>
    </div>
  );

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@university.edu' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'department', label: 'Department', type: 'text', placeholder: 'Computer Science' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="animate-fadeInUp" style={{
        width: '100%', maxWidth: 420,
        background: 'var(--gradient-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 28, fontWeight: 700, marginBottom: 6,
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em',
          }}>Join CampusHUB</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>
            Create your account to get started
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: '1.25rem',
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--color-text-danger)',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.name} style={{ marginBottom: '1.15rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>{f.label}</label>
              <input name={f.name} type={f.type} value={form[f.name]}
                onChange={handleChange} placeholder={f.placeholder}
                style={{ width: '100%' }} required />
            </div>
          ))}
          <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: 15, padding: '12px', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: 13, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}