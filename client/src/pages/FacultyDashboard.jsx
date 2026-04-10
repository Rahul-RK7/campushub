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
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontWeight: 600, fontSize: 20 }}>Faculty Dashboard</h2>
                    <span className="badge badge-accent">
                        {pending.length} Pending
                    </span>
                </div>

                <div className="animate-fadeInUp" style={{
                    background: 'var(--gradient-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'var(--color-bg-elevated)',
                    }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                            Pending Registrations
                        </h3>
                        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
                            Review and approve student accounts
                        </p>
                    </div>

                    <div style={{ padding: '0.5rem' }}>
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <div style={{
                                    width: 30, height: 30, border: '3px solid var(--color-border)',
                                    borderTopColor: 'var(--color-accent)',
                                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                                }} />
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}

                        {!loading && pending.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-tertiary)' }}>
                                <p style={{ fontSize: 28, marginBottom: 8 }}>✅</p>
                                <p style={{ fontSize: 14, fontWeight: 500 }}>All caught up!</p>
                                <p style={{ fontSize: 12, marginTop: 4 }}>No pending registrations at this time.</p>
                            </div>
                        )}

                        {pending.map((student, i) => (
                            <div key={student._id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                margin: '4px',
                                background: 'var(--color-bg-input)',
                                transition: 'background var(--transition-fast)',
                                animation: `fadeInUp 0.4s ease ${i * 0.05}s both`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%',
                                        background: 'var(--color-bg-elevated)',
                                        border: '1px solid var(--color-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 15, fontWeight: 700, color: 'var(--color-text-secondary)',
                                    }}>
                                        {student.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>{student.name}</p>
                                        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
                                            {student.email}
                                        </p>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                            {student.department && (
                                                <span className="badge badge-accent" style={{ fontSize: 10 }}>{student.department}</span>
                                            )}
                                            <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                                                {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleAction(student._id, 'approve')}
                                        className="btn-success" style={{ fontSize: 12, padding: '7px 16px' }}>
                                        Approve
                                    </button>
                                    <button onClick={() => handleAction(student._id, 'reject')}
                                        className="btn-danger" style={{ fontSize: 12, padding: '7px 16px' }}>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
