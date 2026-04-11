import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'row',
      overflow: 'hidden', background: 'var(--background)',
    }}>
      {/* ── Visual Anchor Side ── */}
      <section style={{
        display: 'flex', flex: '0 0 55%',
        background: 'var(--primary)',
        position: 'relative',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem', overflow: 'hidden',
      }}>
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(59,48,158,0.92) 0%, rgba(83,74,183,0.85) 100%)',
          zIndex: 1,
        }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 480, color: 'var(--on-primary)' }}>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800, letterSpacing: '-0.04em',
            marginBottom: '1.5rem', lineHeight: 1.1,
          }}>CampusHUB</h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.375rem)',
            fontWeight: 500, opacity: 0.9,
            lineHeight: 1.6, marginBottom: '2rem',
          }}>
            Your curated gateway to academic excellence and campus life.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              opacity: 0.7,
            }}>The Academic Curator</span>
          </div>
        </div>
        {/* Decorative blob */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 256, height: 256,
          background: 'rgba(209,204,255,0.15)',
          borderRadius: '50%', filter: 'blur(60px)', zIndex: 0,
        }} />
      </section>

      {/* ── Form Section ── */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '3rem',
        background: 'var(--surface-container-lowest)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile brand */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '1.875rem', fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--on-surface)', marginBottom: '0.5rem',
            }}>Welcome back</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', marginBottom: '1.25rem',
              background: 'var(--error-container)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem', color: 'var(--on-error-container)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.6875rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--on-surface-variant)', marginBottom: 6, marginLeft: 4,
              }}>University Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--outline)', display: 'flex',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>alternate_email</span>
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@university.edu" required
                  style={{
                    width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'var(--surface-container-low)',
                    border: 'none', borderRadius: 'var(--radius-xl)',
                    fontSize: '0.875rem', color: 'var(--on-surface)',
                    outline: 'none', transition: 'background 200ms ease',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                marginBottom: 6, padding: '0 4px',
              }}>
                <label style={{
                  fontSize: '0.6875rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--on-surface-variant)',
                }}>Password</label>
                <a href="#" style={{
                  fontSize: '0.75rem', fontWeight: 500,
                  color: 'var(--primary)', textDecoration: 'none',
                  transition: 'color 150ms ease',
                }}>Forgot?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--outline)', display: 'flex',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock</span>
                </div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'var(--surface-container-low)',
                    border: 'none', borderRadius: 'var(--radius-xl)',
                    fontSize: '0.875rem', color: 'var(--on-surface)',
                    outline: 'none', transition: 'background 200ms ease',
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '1rem 1.5rem',
              background: 'var(--gradient-primary)',
              color: 'var(--on-primary)',
              fontWeight: 700, fontSize: '0.9375rem',
              borderRadius: 'var(--radius-xl)',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 14px rgba(59,48,158,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 200ms ease',
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '1.5rem', paddingTop: '1.5rem',
            borderTop: '1px solid var(--surface-container)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{
                color: 'var(--primary)', fontWeight: 700,
                textDecoration: 'none',
              }}>Create an account</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}