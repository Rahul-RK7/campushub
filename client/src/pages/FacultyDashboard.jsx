import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

export default function FacultyDashboard() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/faculty/pending')
            .then(({ data }) => setPending(data))
            .catch(() => setPending([]))
            .finally(() => setLoading(false));
    }, []);

    const handleAction = async (id, action) => {
        try {
            await api.patch(`/api/faculty/${action}/${id}`);
            setPending(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* ── Dashboard Header ── */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap',
                    justifyContent: 'space-between', alignItems: 'flex-end',
                    marginBottom: '2.5rem', gap: '1.5rem',
                }}>
                    <div>
                        <span style={{
                            color: 'var(--primary)', fontWeight: 600,
                            letterSpacing: '0.1em', fontSize: '0.75rem',
                            textTransform: 'uppercase', marginBottom: 8, display: 'block',
                        }}>Administration</span>
                        <h1 style={{
                            fontFamily: "'Manrope', sans-serif",
                            fontSize: '2.25rem', fontWeight: 800,
                            letterSpacing: '-0.02em',
                            color: 'var(--on-surface)', margin: 0,
                        }}>Faculty Dashboard</h1>
                        <p style={{
                            color: 'var(--on-surface-variant)', marginTop: 8,
                            maxWidth: 400, fontSize: '0.9375rem', lineHeight: 1.5,
                        }}>
                            Review and manage pending student registrations for the upcoming academic semester.
                        </p>
                    </div>
                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            background: 'var(--surface-container-low)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-xl)',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            minWidth: 150,
                        }}>
                            <div style={{
                                background: 'rgba(59,48,158,0.1)',
                                padding: 8, borderRadius: 'var(--radius-md)',
                                display: 'flex', alignItems: 'center',
                            }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>group</span>
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '0.6875rem', textTransform: 'uppercase',
                                    letterSpacing: '-0.02em', fontWeight: 700,
                                    color: 'var(--on-surface-variant)', margin: 0,
                                }}>Pending</p>
                                <p style={{
                                    fontSize: '1.5rem', fontWeight: 700,
                                    color: 'var(--primary)', margin: 0,
                                }}>{pending.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Registration Queue ── */}
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '1rem',
                    }}>
                        <h2 style={{
                            fontFamily: "'Manrope', sans-serif",
                            fontSize: '1.25rem', fontWeight: 700,
                            color: 'var(--on-surface)',
                            display: 'flex', alignItems: 'center', gap: 8,
                            margin: 0,
                        }}>
                            Registration Queue
                            <span style={{
                                background: 'var(--surface-container-high)',
                                color: 'var(--on-surface-variant)',
                                padding: '0.125rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem', fontWeight: 700,
                            }}>{pending.length} TOTAL</span>
                        </h2>
                    </div>

                    {/* Registration Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div style={{
                                    width: 36, height: 36,
                                    border: '3px solid var(--surface-container-high)',
                                    borderTopColor: 'var(--primary)',
                                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                                }} />
                            </div>
                        )}

                        {!loading && pending.length === 0 && (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '4rem', textAlign: 'center',
                            }}>
                                <div style={{
                                    width: 80, height: 80,
                                    background: 'var(--surface-container-high)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                }}>
                                    <span className="material-symbols-outlined" style={{
                                        fontSize: 40, color: 'var(--outline-variant)',
                                    }}>inbox</span>
                                </div>
                                <h3 style={{
                                    fontFamily: "'Manrope', sans-serif",
                                    fontSize: '1.5rem', fontWeight: 700,
                                    color: 'var(--on-surface)', marginBottom: 8,
                                }}>All Caught Up!</h3>
                                <p style={{
                                    color: 'var(--on-surface-variant)',
                                    maxWidth: 360, fontSize: '0.9375rem',
                                }}>No pending student registrations in your queue.</p>
                            </div>
                        )}

                        {pending.map((student, i) => (
                            <div key={student._id} className="animate-fadeIn" style={{
                                background: 'var(--surface-container-lowest)',
                                padding: '1.5rem',
                                borderRadius: 'var(--radius-xl)',
                                boxShadow: '0px 20px 40px rgba(25,28,29,0.03)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', gap: '1.5rem',
                                transition: 'transform 200ms ease',
                                animationDelay: `${i * 50}ms`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 56, height: 56, borderRadius: '50%',
                                        background: 'var(--secondary-container)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18, fontWeight: 700,
                                        color: 'var(--on-secondary-container)',
                                        border: '2px solid var(--surface-container)',
                                    }}>
                                        {student.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontWeight: 700, fontSize: '1.125rem',
                                            color: 'var(--on-surface)', margin: 0,
                                        }}>{student.name}</h3>
                                        <p style={{
                                            fontSize: '0.875rem', color: 'var(--on-surface-variant)',
                                            margin: '2px 0 0',
                                        }}>{student.email}</p>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            marginTop: 8,
                                        }}>
                                            {student.registrationId && (
                                                <span style={{
                                                    background: 'var(--primary-fixed)',
                                                    color: 'var(--on-primary-fixed-variant)',
                                                    fontSize: '0.625rem', fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    letterSpacing: '0.06em',
                                                }}>ID: {student.registrationId}</span>
                                            )}
                                            {student.department && (
                                                <span style={{
                                                    background: 'var(--surface-container-high)',
                                                    color: 'var(--on-secondary-fixed-variant)',
                                                    fontSize: '0.625rem', fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    letterSpacing: '0.06em',
                                                }}>{student.department}</span>
                                            )}
                                            <span style={{
                                                fontSize: '0.625rem', color: 'var(--outline)',
                                                fontWeight: 500,
                                                display: 'flex', alignItems: 'center', gap: 4,
                                            }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_today</span>
                                                {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => handleAction(student._id, 'reject')}
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            borderRadius: 'var(--radius-xl)',
                                            fontSize: '0.875rem', fontWeight: 600,
                                            background: 'var(--surface-container-high)',
                                            color: 'var(--primary)',
                                            border: 'none', cursor: 'pointer',
                                            transition: 'all 150ms ease',
                                        }}
                                    >Reject</button>
                                    <button
                                        onClick={() => handleAction(student._id, 'approve')}
                                        style={{
                                            padding: '0.625rem 1.5rem',
                                            borderRadius: 'var(--radius-xl)',
                                            fontSize: '0.875rem', fontWeight: 700,
                                            background: 'var(--gradient-primary)',
                                            color: 'var(--on-primary)',
                                            border: 'none', cursor: 'pointer',
                                            boxShadow: '0 4px 14px rgba(59,48,158,0.2)',
                                            transition: 'all 150ms ease',
                                        }}
                                    >Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
