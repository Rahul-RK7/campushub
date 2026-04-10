import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Profile() {
    const { user: authUser, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', bio: '', department: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/api/users/me')
            .then(({ data }) => {
                setProfile(data);
                setForm({ name: data.name || '', bio: data.bio || '', department: data.department || '' });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.patch('/api/users/me', form);
            setProfile(data);
            setEditing(false);
            const token = localStorage.getItem('token');
            login(token, { ...authUser, name: data.name });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save');
        }
        setSaving(false);
    };

    if (loading) return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div style={{
                    width: 36, height: 36, border: '3px solid var(--color-border)',
                    borderTopColor: 'var(--color-accent)',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1rem' }}>
                <h2 style={{ fontWeight: 600, marginBottom: '1.5rem', fontSize: 20 }}>My Profile</h2>

                <div className="animate-fadeInUp" style={{
                    background: 'var(--gradient-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                }}>
                    {/* Profile header banner */}
                    <div style={{
                        height: 80,
                        background: 'var(--gradient-accent)',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute', bottom: -28, left: 24,
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'var(--color-bg-card)',
                            border: '3px solid var(--color-bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 700, color: 'var(--color-accent)',
                        }}>
                            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    </div>

                    <div style={{ padding: '2.5rem 1.5rem 1.5rem' }}>
                        {!editing ? (
                            <>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 2px' }}>{profile?.name}</h3>
                                    <span className="badge badge-accent" style={{ marginTop: 4 }}>
                                        {profile?.role}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: 16, marginBottom: '1.5rem' }}>
                                    {[
                                        { label: 'Email', value: profile?.email },
                                        { label: 'Department', value: profile?.department || '—' },
                                        { label: 'Bio', value: profile?.bio || 'No bio yet.' },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{item.label}</p>
                                            <p style={{ fontSize: 14, color: 'var(--color-text)', margin: 0, lineHeight: 1.5 }}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                                        Joined {new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button onClick={() => setEditing(true)} className="btn-primary"
                                        style={{ fontSize: 13, padding: '8px 20px' }}>
                                        Edit Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {['name', 'department'].map(field => (
                                    <div key={field} style={{ marginBottom: '1.15rem' }}>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'capitalize' }}>{field}</label>
                                        <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                                            style={{ width: '100%' }} />
                                    </div>
                                ))}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Bio</label>
                                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                                        rows={3} maxLength={200}
                                        style={{ width: '100%', resize: 'none', fontFamily: 'inherit' }} />
                                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>{form.bio.length}/200</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button onClick={() => setEditing(false)} style={{ fontSize: 13, padding: '8px 20px' }}>Cancel</button>
                                    <button onClick={handleSave} disabled={saving} className="btn-primary"
                                        style={{ fontSize: 13, padding: '8px 20px' }}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
