import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', registrationId: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (!form.registrationId.trim()) return 'Registration ID is required';
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
      padding: '2rem', background: 'var(--background)',
    }}>
      <div className="animate-fadeInUp" style={{
        width: '100%', maxWidth: 480, textAlign: 'center',
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)', padding: '3rem',
        boxShadow: 'var(--shadow-whisper)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--tertiary-fixed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <span className="material-symbols-outlined" style={{
            color: 'var(--tertiary)', fontSize: 28,
            fontVariationSettings: "'FILL' 1",
          }}>verified_user</span>
        </div>
        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700, fontSize: '1.25rem',
          color: 'var(--on-surface)', marginBottom: 8,
        }}>{success}</p>
        <p style={{
          fontSize: '0.875rem', color: 'var(--on-surface-variant)',
          marginBottom: '1.5rem', lineHeight: 1.6,
        }}>
          A faculty member will review your application. You'll be able to log in once approved.
        </p>
        <Link to="/login" style={{
          fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)',
          textDecoration: 'none',
        }}>← Back to Login</Link>
      </div>
    </div>
  );

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', icon: 'person' },
    { name: 'email', label: 'University Email', type: 'email', placeholder: 'j.doe@university.edu', icon: 'mail' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: 'lock' },
    { name: 'registrationId', label: 'Student Registration ID', type: 'text', placeholder: 'e.g. STU2024001', icon: 'badge' },
    { name: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Computer Science', icon: 'account_balance' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: 'var(--background)', position: 'relative',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: '-10%', right: '-10%',
        width: '40%', height: '40%', borderRadius: '50%',
        background: 'rgba(59,48,158,0.04)', filter: 'blur(120px)',
        zIndex: 0, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', left: '-10%',
        width: '30%', height: '30%', borderRadius: '50%',
        background: 'rgba(104,53,0,0.03)', filter: 'blur(100px)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      <main style={{
        width: '100%', maxWidth: 960,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-whisper)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Left: Branding */}
        <section style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '3rem',
          background: 'linear-gradient(135deg, #3b309e 0%, #534ab7 100%)',
          color: 'var(--on-primary)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '3rem' }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 28, fontVariationSettings: "'FILL' 1",
              }}>school</span>
              <span style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em',
              }}>CampusHUB</span>
            </div>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '2rem', fontWeight: 700,
              lineHeight: 1.3, marginBottom: '1.5rem',
            }}>Join the next generation of academic collaboration.</h1>
            <p style={{
              fontSize: '1rem', opacity: 0.85, lineHeight: 1.7, maxWidth: 400,
            }}>
              Connect with faculty, manage your curriculum, and engage with your campus community.
            </p>
          </div>
          {/* Testimonial card */}
          <div style={{
            position: 'relative', zIndex: 1,
            marginTop: '2rem',
            padding: '1.25rem',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--primary-fixed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'var(--primary)',
              }}>SJ</div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sarah Jenkins</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Computer Science Department</p>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', opacity: 0.9, lineHeight: 1.5 }}>
              "The streamlined faculty approval process made my registration seamless this semester."
            </p>
          </div>
        </section>

        {/* Right: Form */}
        <section style={{
          padding: '2.5rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '1.875rem', fontWeight: 800,
              color: 'var(--primary)', letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}>Create Account</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
              Fill in your details to begin your academic journey.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', marginBottom: '1rem',
              background: 'var(--error-container)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem', color: 'var(--on-error-container)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fields.map(f => (
              <div key={f.name}>
                <label style={{
                  display: 'block', fontSize: '0.6875rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--on-surface-variant)', marginBottom: 6, marginLeft: 4,
                }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 20, color: 'var(--outline)',
                  }}>{f.icon}</span>
                  <input
                    name={f.name} type={f.type} value={form[f.name]}
                    onChange={handleChange} placeholder={f.placeholder} required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      background: 'var(--surface-container-low)',
                      border: 'none', borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem', color: 'var(--on-surface)',
                      outline: 'none', transition: 'background 200ms ease',
                    }}
                  />
                </div>
              </div>
            ))}



            {/* Submit */}
            <div style={{ paddingTop: '0.5rem' }}>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '1rem 1.5rem',
                background: 'var(--gradient-primary)',
                color: 'var(--on-primary)',
                fontWeight: 700, fontSize: '0.9375rem',
                borderRadius: 'var(--radius-xl)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(59,48,158,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 200ms ease',
              }}>
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '2rem', paddingTop: '2rem',
            borderTop: '1px solid var(--surface-variant)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{
                color: 'var(--primary)', fontWeight: 600,
                textDecoration: 'none',
              }}>Login here</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}