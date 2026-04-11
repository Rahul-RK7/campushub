import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);          // 1 = email, 2 = OTP, 3 = new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const otpRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // ── Step 1: Send OTP ──
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return; }
        setLoading(true); setError('');
        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            setSuccess(data.message);
            setStep(2);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        }
        setLoading(false);
    };

    // ── Step 2: Verify OTP ──
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpStr = otp.join('');
        if (otpStr.length !== 6) { setError('Please enter the full 6-digit OTP'); return; }
        setLoading(true); setError('');
        try {
            const { data } = await api.post('/api/auth/verify-otp', { email, otp: otpStr });
            setResetToken(data.resetToken);
            setSuccess(data.message);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'OTP verification failed');
        }
        setLoading(false);
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setLoading(true); setError(''); setSuccess('');
        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            setSuccess(data.message);
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        }
        setLoading(false);
    };

    // ── Step 3: Reset Password ──
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');
        try {
            const { data } = await api.post('/api/auth/reset-password', { email, newPassword, resetToken });
            setSuccess(data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Password reset failed');
        }
        setLoading(false);
    };

    // ── Shared styles ──
    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.75rem',
        background: 'var(--surface-container-low)',
        border: 'none', borderRadius: 'var(--radius-xl)',
        fontSize: '0.875rem', color: 'var(--on-surface)',
        outline: 'none', transition: 'background 200ms ease',
    };
    const labelStyle = {
        display: 'block', fontSize: '0.6875rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--on-surface-variant)', marginBottom: 6, marginLeft: 4,
    };
    const btnStyle = {
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
    };

    const titles = {
        1: { heading: 'Reset your password', sub: 'Enter your registered email and we\'ll send you a one-time verification code.' },
        2: { heading: 'Enter verification code', sub: `We've sent a 6-digit code to ${email}` },
        3: { heading: 'Create new password', sub: 'Your identity has been verified. Set a new password below.' },
    };

    const stepIcons = ['mail', 'pin', 'lock_reset'];

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
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(59,48,158,0.92) 0%, rgba(83,74,183,0.85) 100%)',
                    zIndex: 1,
                }} />
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
                        Secure account recovery in three simple steps.
                    </p>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                opacity: s <= step ? 1 : 0.35,
                                transition: 'opacity 300ms ease',
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: s === step ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                                    border: s <= step ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.15)',
                                    transition: 'all 300ms ease',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>
                                        {s < step ? 'check_circle' : stepIcons[s - 1]}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                                    {['Email', 'Verify', 'Reset'][s - 1]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.3)' }} />
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 600,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            opacity: 0.7,
                        }}>The Academic Curator</span>
                    </div>
                </div>
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
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{
                            fontFamily: "'Manrope', sans-serif",
                            fontSize: '1.875rem', fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: 'var(--on-surface)', marginBottom: '0.5rem',
                        }}>{titles[step].heading}</h2>
                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
                            {titles[step].sub}
                        </p>
                    </div>

                    {/* Error */}
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

                    {/* Success */}
                    {success && (
                        <div style={{
                            padding: '0.75rem 1rem', marginBottom: '1.25rem',
                            background: 'rgba(76,175,80,0.1)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8125rem', color: '#2e7d32',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                            {success}
                        </div>
                    )}

                    {/* ═══════ Step 1: Email ═══════ */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>University Email</label>
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
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={btnStyle}>
                                {loading ? 'Sending...' : 'Send Verification Code'}
                                {!loading && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>}
                            </button>
                        </form>
                    )}

                    {/* ═══════ Step 2: OTP ═══════ */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>6-Digit Code</label>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }} onPaste={handleOtpPaste}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => otpRefs.current[i] = el}
                                            type="text" inputMode="numeric" maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(i, e)}
                                            style={{
                                                width: 52, height: 60, textAlign: 'center',
                                                fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em',
                                                background: 'var(--surface-container-low)',
                                                border: digit ? '2px solid var(--primary)' : '2px solid transparent',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--on-surface)',
                                                outline: 'none', transition: 'border 200ms ease, background 200ms ease',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={btnStyle}>
                                {loading ? 'Verifying...' : 'Verify Code'}
                                {!loading && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>verified</span>}
                            </button>

                            <div style={{ textAlign: 'center' }}>
                                <button
                                    type="button" onClick={handleResend} disabled={countdown > 0 || loading}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: countdown > 0 ? 'var(--on-surface-variant)' : 'var(--primary)',
                                        cursor: countdown > 0 ? 'default' : 'pointer',
                                        fontSize: '0.8125rem', fontWeight: 600,
                                    }}
                                >
                                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ═══════ Step 3: New Password ═══════ */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: 'var(--outline)', display: 'flex',
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock</span>
                                    </div>
                                    <input
                                        type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••••" required minLength={6}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                        color: 'var(--outline)', display: 'flex',
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock_reset</span>
                                    </div>
                                    <input
                                        type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••" required minLength={6}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={btnStyle}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                                {!loading && <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock_open</span>}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div style={{
                        marginTop: '1.5rem', paddingTop: '1.5rem',
                        borderTop: '1px solid var(--surface-container)',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                            Remember your password?{' '}
                            <Link to="/login" style={{
                                color: 'var(--primary)', fontWeight: 700,
                                textDecoration: 'none',
                            }}>Back to Sign In</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
