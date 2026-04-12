import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { onlineUsers } = useSocket();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [msgLoading, setMsgLoading] = useState(false);
    const [listModal, setListModal] = useState(null);

    // If viewing own profile, redirect to /profile
    useEffect(() => {
        if (id === authUser?._id) navigate('/profile', { replace: true });
    }, [id, authUser?._id, navigate]);

    useEffect(() => {
        setLoading(true);
        setPostsLoading(true);
        api.get(`/api/users/${id}`)
            .then(({ data }) => {
                setProfile(data);
                setFollowing(data.isFollowing);
            })
            .catch(() => navigate('/feed'))
            .finally(() => setLoading(false));

        api.get(`/api/posts/user/${id}`)
            .then(({ data }) => setPosts(data.posts || []))
            .catch(() => setPosts([]))
            .finally(() => setPostsLoading(false));
    }, [id]);

    const handleFollow = async () => {
        if (followLoading) return;
        setFollowLoading(true);
        try {
            const { data } = await api.post(`/api/users/${id}/follow`);
            setFollowing(data.isFollowing);
            setProfile(prev => ({
                ...prev,
                followerCount: data.followerCount,
            }));
        } catch (err) {
            console.error('Follow failed:', err);
        }
        setFollowLoading(false);
    };

    const handleMessage = async () => {
        if (msgLoading) return;
        setMsgLoading(true);
        try {
            const { data } = await api.post('/api/messages/conversations', { participantId: id });
            navigate('/messages', { state: { openConversation: data } });
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
        setMsgLoading(false);
    };

    const handleDeletePost = (postId) => {
        setPosts(prev => prev.filter(p => p._id !== postId));
    };

    const isOnline = onlineUsers.includes(id);

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

    if (!profile) return null;

    return (
        <Layout>
            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* ── Profile Header ── */}
                <section style={{ marginBottom: '3rem' }}>
                    {/* Cover Banner */}
                    <div style={{
                        position: 'relative', height: 240,
                        borderRadius: 'var(--radius-3xl)',
                        overflow: 'hidden', marginBottom: '-4rem',
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
                            position: 'relative',
                        }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: 'var(--gradient-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '3rem', fontWeight: 800,
                                letterSpacing: '-0.02em', overflow: 'hidden',
                            }}>
                                {profile?.profilePic ? (
                                    <img src={profile.profilePic} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
                                )}
                            </div>
                            {/* Online indicator */}
                            {isOnline && (
                                <div style={{
                                    position: 'absolute', bottom: 8, right: 8,
                                    width: 20, height: 20, borderRadius: '50%',
                                    background: '#22c55e', border: '3px solid white',
                                }} />
                            )}
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
                                }}>{profile.name}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                        fontSize: '0.6875rem', fontWeight: 600,
                                        color: 'var(--primary)',
                                        background: 'var(--primary-fixed)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                    }}>{profile.role || 'STUDENT'}</span>
                                    <span style={{
                                        fontSize: '0.875rem', fontWeight: 500,
                                        color: 'var(--on-surface-variant)',
                                    }}>{profile.department || ''}</span>
                                    {isOnline && (
                                        <span style={{
                                            fontSize: '0.6875rem', fontWeight: 600,
                                            color: '#22c55e',
                                        }}>● Online</span>
                                    )}
                                </div>
                                <p style={{
                                    color: 'var(--on-surface-variant)',
                                    maxWidth: 600, fontSize: '0.9375rem', lineHeight: 1.6,
                                }}>
                                    {profile.bio || 'No bio yet.'}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleMessage} disabled={msgLoading} style={{
                                    background: 'var(--surface-container-lowest)',
                                    color: 'var(--primary)', padding: '0.625rem 1.5rem',
                                    borderRadius: 'var(--radius-xl)',
                                    fontWeight: 600, fontSize: '0.875rem',
                                    border: '1.5px solid var(--primary)',
                                    cursor: msgLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    transition: 'all 200ms ease',
                                    opacity: msgLoading ? 0.6 : 1,
                                }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-fixed)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-container-lowest)'; }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
                                    {msgLoading ? 'Opening...' : 'Message'}
                                </button>
                                <button onClick={handleFollow} disabled={followLoading} style={{
                                    background: following ? 'var(--surface-container-high)' : 'var(--gradient-primary)',
                                    color: following ? 'var(--on-surface-variant)' : 'white',
                                    padding: '0.625rem 1.5rem',
                                    borderRadius: 'var(--radius-xl)',
                                    fontWeight: 600, fontSize: '0.875rem',
                                    border: 'none', cursor: followLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    transition: 'all 200ms ease',
                                    boxShadow: following ? 'none' : '0 4px 14px rgba(59,48,158,0.2)',
                                    opacity: followLoading ? 0.6 : 1,
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                        {following ? 'person_remove' : 'person_add'}
                                    </span>
                                    {followLoading ? '...' : following ? 'Unfollow' : 'Follow'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Main Content ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem',
                }}>
                    {/* Left: User Posts */}
                    <div>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '2rem',
                        }}>
                            <h2 style={{
                                fontFamily: "'Manrope', sans-serif",
                                fontSize: '1.5rem', fontWeight: 700,
                                letterSpacing: '-0.01em',
                            }}>
                                Posts by {profile.name?.split(' ')[0]}
                            </h2>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                color: 'var(--outline)',
                            }}>{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
                        </div>

                        {postsLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div style={{
                                    width: 28, height: 28,
                                    border: '3px solid var(--surface-container-high)',
                                    borderTopColor: 'var(--primary)',
                                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                                }} />
                            </div>
                        ) : posts.length === 0 ? (
                            <div style={{
                                background: 'var(--surface-container-lowest)',
                                borderRadius: 'var(--radius-xl)',
                                padding: '3rem 2rem', textAlign: 'center',
                                boxShadow: 'var(--shadow-whisper)',
                            }}>
                                <span className="material-symbols-outlined" style={{
                                    fontSize: 48, color: 'var(--outline)', marginBottom: '0.75rem', display: 'block',
                                }}>edit_note</span>
                                <p style={{
                                    color: 'var(--on-surface-variant)',
                                    fontSize: '0.9375rem', margin: 0,
                                }}>No posts yet.</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard key={post._id} post={post} onDelete={handleDeletePost} followingList={(profile?.following || []).map(f => f._id || f)} />
                            ))
                        )}
                    </div>

                    {/* Right: Stats & Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Stats Bento */}
                        <div style={{
                            background: 'var(--surface-container-low)',
                            padding: '2rem', borderRadius: 'var(--radius-3xl)',
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
                                    { value: posts.length, label: 'Posts', color: 'var(--primary)' },
                                    { value: profile.followerCount || 0, label: 'Followers', color: 'var(--primary)', clickable: true, action: () => setListModal('followers') },
                                    { value: profile.followingCount || 0, label: 'Following', color: 'var(--primary)', clickable: true, action: () => setListModal('following') },
                                    { value: '—', label: 'Awards', color: 'var(--tertiary)' },
                                ].map((stat, i) => (
                                    <div key={i} onClick={stat.clickable ? stat.action : undefined} style={{
                                        background: 'var(--surface-container-lowest)',
                                        padding: '1rem', borderRadius: 'var(--radius-2xl)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        cursor: stat.clickable ? 'pointer' : 'default',
                                        transition: 'transform 150ms ease, box-shadow 150ms ease',
                                    }}
                                        onMouseOver={e => { if (stat.clickable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; } }}
                                        onMouseOut={e => { if (stat.clickable) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; } }}
                                    >
                                        <div style={{ color: stat.color, fontWeight: 800, fontSize: '1.875rem' }}>{stat.value}</div>
                                        <div style={{
                                            fontSize: '0.625rem', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            color: 'var(--on-surface-variant)',
                                        }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Card */}
                        <div style={{
                            background: 'var(--surface-container-low)',
                            borderRadius: 'var(--radius-3xl)', padding: '1.5rem',
                        }}>
                            <h4 style={{
                                fontSize: '0.875rem', fontWeight: 700,
                                color: 'var(--on-surface)', marginBottom: '0.75rem',
                            }}>Profile Info</h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {[
                                    { label: 'Department', value: profile.department || '—' },
                                    { label: 'Role', value: profile.role === 'faculty' ? 'Faculty' : 'Student' },
                                    { label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
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
                </div>
            </div>

            {/* ── Followers/Following Modal ── */}
            {listModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(25,28,29,0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }} onClick={() => setListModal(null)}>
                    <div className="animate-fadeInUp" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--surface-container-lowest)',
                        width: '100%', maxWidth: 400,
                        borderRadius: 'var(--radius-3xl)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        maxHeight: '70vh', display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid rgba(200,196,213,0.2)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <h3 style={{
                                fontFamily: "'Manrope', sans-serif",
                                fontSize: '1.25rem', fontWeight: 800,
                                color: 'var(--on-surface)', margin: 0,
                                textTransform: 'capitalize',
                            }}>{listModal}</h3>
                            <button onClick={() => setListModal(null)} style={{
                                background: 'transparent', border: 'none', padding: 8,
                                borderRadius: '50%', cursor: 'pointer',
                                display: 'flex', alignItems: 'center',
                            }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>close</span>
                            </button>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
                            {(profile?.[listModal] || []).length === 0 ? (
                                <p style={{
                                    textAlign: 'center', color: 'var(--outline)',
                                    fontSize: '0.875rem', padding: '2rem 0',
                                }}>
                                    {listModal === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                                </p>
                            ) : (
                                (profile?.[listModal] || []).map(u => (
                                    <div
                                        key={u._id || u}
                                        onClick={() => { setListModal(null); navigate(`/profile/${u._id}`); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem 0', cursor: 'pointer',
                                            borderBottom: '1px solid rgba(200,196,213,0.1)',
                                            transition: 'background 150ms ease',
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            background: 'var(--gradient-primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0, overflow: 'hidden',
                                        }}>
                                            {u.profilePic ? (
                                                <img src={u.profilePic} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                                                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{
                                            fontWeight: 600, fontSize: '0.9375rem',
                                            color: 'var(--on-surface)',
                                        }}>{u.name || 'Unknown'}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
