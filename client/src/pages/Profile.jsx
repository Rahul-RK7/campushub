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
            login(token, { ...authUser, name: data.name, department: data.department, bio: data.bio });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save');
        }
        setSaving(false);
    };

    if (loading) return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
                <div style={{
                    width: 36, height: 36,
                    border: '3px solid var(--surface-container-high)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* ── Profile Header Section ── */}
                <section style={{ marginBottom: '3rem' }}>
                    {/* Cover Banner */}
                    <div style={{
                        position: 'relative', height: 240,
                        borderRadius: 'var(--radius-3xl)',
                        overflow: 'hidden',
                        marginBottom: '-4rem',
                        background: 'var(--gradient-primary)',
                    }}>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
                        }} />
                    </div>

                    {/* Profile Info */}
                    <div style={{
                        position: 'relative', zIndex: 10,
                        padding: '0 1.5rem',
                        display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '1.5rem',
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: 140, height: 140, borderRadius: '50%',
                            background: 'white', padding: 4,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: 'var(--gradient-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '3rem', fontWeight: 800,
                                letterSpacing: '-0.02em',
                            }}>
                                {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                            </div>
                        </div>

                        {/* Name & Info */}
                        <div style={{
                            flex: 1, display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-end', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem',
                        }}>
                            <div>
                                <h1 style={{
                                    fontFamily: "'Manrope', sans-serif",
                                    fontSize: '2rem', fontWeight: 800,
                                    color: 'var(--on-surface)', margin: '0 0 0.5rem',
                                }}>{profile?.name}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                        fontSize: '0.6875rem', fontWeight: 600,
                                        color: 'var(--primary)',
                                        background: 'var(--primary-fixed)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                    }}>{profile?.role || 'STUDENT'}</span>
                                    <span style={{
                                        fontSize: '0.875rem', fontWeight: 500,
                                        color: 'var(--on-surface-variant)',
                                    }}>{profile?.department || ''}</span>
                                </div>
                                <p style={{
                                    color: 'var(--on-surface-variant)',
                                    maxWidth: 600, fontSize: '0.9375rem', lineHeight: 1.6,
                                }}>
                                    {profile?.bio || 'No bio yet. Click "Edit Profile" to add one.'}
                                </p>
                            </div>
                            <button onClick={() => setEditing(true)} style={{
                                background: 'var(--gradient-primary)',
                                color: 'white', padding: '0.625rem 1.5rem',
                                borderRadius: 'var(--radius-xl)',
                                fontWeight: 600, fontSize: '0.875rem',
                                border: 'none', cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(59,48,158,0.2)',
                                display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 200ms ease',
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Main Content ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem',
                }}>
                    {/* Left: Posts placeholder */}
                    <div>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '2rem',
                        }}>
                            <h2 style={{
                                fontFamily: "'Manrope', sans-serif",
                                fontSize: '1.5rem', fontWeight: 700,
                                letterSpacing: '-0.01em',
                            }}>Published Posts</h2>
                        </div>
                        {/* Info cards */}
                        <div style={{
                            background: 'var(--surface-container-lowest)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '1.5rem',
                            boxShadow: 'var(--shadow-whisper)',
                        }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {[
                                    { label: 'Email', value: profile?.email },
                                    { label: 'Department', value: profile?.department || '—' },
                                    { label: 'Member Since', value: new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
                                ].map(item => (
                                    <div key={item.label}>
                                        <p style={{
                                            fontSize: '0.625rem', fontWeight: 700,
                                            color: 'var(--on-surface-variant)',
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            marginBottom: 4,
                                        }}>{item.label}</p>
                                        <p style={{
                                            fontSize: '0.875rem', color: 'var(--on-surface)',
                                            margin: 0, lineHeight: 1.5,
                                        }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Stats Bento */}
                        <div style={{
                            background: 'var(--surface-container-low)',
                            padding: '2rem',
                            borderRadius: 'var(--radius-3xl)',
                        }}>
                            <h3 style={{
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                fontSize: '0.6875rem', fontWeight: 800,
                                color: 'var(--on-surface-variant)',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid rgba(200,196,213,0.2)',
                                marginBottom: '1rem',
                            }}>Activity Stats</h3>
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                            }}>
                                {[
                                    { value: '—', label: 'Total Posts', color: 'var(--primary)' },
                                    { value: '—', label: 'Followers', color: 'var(--primary)' },
                                    { value: '—', label: 'Following', color: 'var(--primary)' },
                                    { value: '—', label: 'Awards', color: 'var(--tertiary)' },
                                ].map((stat, i) => (
                                    <div key={i} style={{
                                        background: 'var(--surface-container-lowest)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-2xl)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    }}>
                                        <div style={{
                                            color: stat.color,
                                            fontWeight: 800, fontSize: '1.875rem',
                                        }}>{stat.value}</div>
                                        <div style={{
                                            fontSize: '0.625rem', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            color: 'var(--on-surface-variant)',
                                        }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Categories */}
                        <div style={{
                            background: 'var(--surface-container-low)',
                            padding: '1.5rem',
                            borderRadius: 'var(--radius-3xl)',
                        }}>
                            <h4 style={{
                                fontSize: '0.875rem', fontWeight: 700,
                                color: 'var(--on-surface)', marginBottom: '0.75rem',
                            }}>Top Categories</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {[profile?.department || 'General', 'Campus Life', 'Open Source'].map((cat, i) => (
                                    <span key={i} style={{
                                        padding: '0.375rem 0.75rem',
                                        background: i === 0 ? 'var(--primary-fixed)' : 'var(--surface-container-highest)',
                                        color: i === 0 ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface-variant)',
                                        borderRadius: 'var(--radius-xl)',
                                        fontSize: '0.75rem', fontWeight: 600,
                                    }}>{cat}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Edit Profile Modal ── */}
            {editing && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(25,28,29,0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div className="animate-fadeInUp" style={{
                        background: 'var(--surface-container-lowest)',
                        width: '100%', maxWidth: 480,
                        borderRadius: 'var(--radius-3xl)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid rgba(200,196,213,0.2)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <h3 style={{
                                fontFamily: "'Manrope', sans-serif",
                                fontSize: '1.25rem', fontWeight: 800,
                                color: 'var(--on-surface)', margin: 0,
                            }}>Edit Profile</h3>
                            <button onClick={() => setEditing(false)} style={{
                                background: 'transparent', border: 'none', padding: 8,
                                borderRadius: '50%', cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                            }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>close</span>
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { key: 'name', label: 'Full Name' },
                                { key: 'department', label: 'Department' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{
                                        display: 'block', fontSize: '0.625rem', fontWeight: 800,
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                        color: 'var(--on-surface-variant)', marginBottom: 8,
                                    }}>{field.label}</label>
                                    <input
                                        value={form[field.key]}
                                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'var(--surface-container-low)',
                                            border: 'none', borderRadius: 'var(--radius-xl)',
                                            padding: '0.75rem 1rem',
                                            fontSize: '0.875rem', color: 'var(--on-surface)',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            ))}
                            <div>
                                <label style={{
                                    display: 'block', fontSize: '0.625rem', fontWeight: 800,
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                    color: 'var(--on-surface-variant)', marginBottom: 8,
                                }}>Bio</label>
                                <textarea
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                    rows={4} maxLength={200}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-container-low)',
                                        border: 'none', borderRadius: 'var(--radius-xl)',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.875rem', color: 'var(--on-surface)',
                                        outline: 'none', resize: 'none',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                />
                                <span style={{
                                    fontSize: '0.6875rem', color: 'var(--outline)', marginTop: 4,
                                    display: 'block',
                                }}>{form.bio.length}/200</span>
                            </div>
                        </div>
                        {/* Modal Footer */}
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--surface-container-low)',
                            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
                        }}>
                            <button onClick={() => setEditing(false)} style={{
                                padding: '0.625rem 1.5rem',
                                borderRadius: 'var(--radius-xl)',
                                fontWeight: 700, fontSize: '0.875rem',
                                background: 'transparent', border: 'none',
                                color: 'var(--on-surface-variant)', cursor: 'pointer',
                            }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} style={{
                                padding: '0.625rem 2rem',
                                background: 'var(--gradient-primary)',
                                color: 'white', borderRadius: 'var(--radius-xl)',
                                fontWeight: 700, fontSize: '0.875rem',
                                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.6 : 1,
                                boxShadow: '0 4px 14px rgba(59,48,158,0.2)',
                            }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
