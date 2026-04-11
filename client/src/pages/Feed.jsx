import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (p = 1) => {
    try {
      const { data } = await api.get('/api/posts?page=' + p);
      setPosts(prev => p === 1 ? data.posts : [...prev, ...data.posts]);
      if (data.posts.length < 10) setHasMore(false);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(1); }, []);

  const onNewPost = (post) => setPosts(prev => [post, ...prev]);

  if (loading) return (
    <Layout>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6rem', color: 'var(--outline)',
      }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        gap: '2rem',
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        {/* ── Left Sidebar: Profile Quick Access ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User card */}
          <div style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              margin: '0 auto 1rem',
              border: '4px solid var(--surface-container-low)',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff',
              overflow: 'hidden',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: '1.125rem', margin: 0,
            }}>{user?.name || 'User'}</h2>
            <p style={{
              fontSize: '0.875rem', color: 'var(--outline)',
              marginBottom: '1rem', marginTop: 4,
            }}>{user?.department || 'Student'}</p>
            <div style={{
              display: 'flex', justifyContent: 'space-around',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(200,196,213,0.1)',
              fontSize: '0.6875rem', fontWeight: 600,
              color: 'var(--outline-variant)', textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              <div>Posts<br /><span style={{ color: 'var(--on-background)', fontSize: '1rem' }}>{posts.length}</span></div>
              <div>Role<br /><span style={{ color: 'var(--on-background)', fontSize: '1rem', textTransform: 'capitalize' }}>{user?.role || '—'}</span></div>
            </div>
          </div>

          {/* Trending Tags */}
          <div style={{
            background: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
          }}>
            <h3 style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: '0.875rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '1rem',
            }}>Trending Tags</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['#Hackathon2024', '#FinalsWeek', '#CampusDining', '#CareerFair'].map(tag => (
                <span key={tag} style={{
                  padding: '0.25rem 0.75rem',
                  background: 'var(--surface-container-highest)',
                  color: 'var(--on-surface-variant)',
                  fontSize: '0.75rem', fontWeight: 500,
                  borderRadius: 'var(--radius-full)',
                }}>{tag}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Center: Feed ── */}
        <section>
          <PostComposer onPost={onNewPost} />
          {posts.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '4rem 1rem',
              color: 'var(--outline)',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 56, color: 'var(--outline-variant)', marginBottom: 12,
                display: 'block',
              }}>dynamic_feed</span>
              <p style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '1.125rem', fontWeight: 600, marginBottom: 4,
              }}>No posts yet</p>
              <p style={{ fontSize: '0.875rem' }}>Be the first to share something!</p>
            </div>
          )}
          {posts.map(p => (
            <PostCard key={p._id} post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} />
          ))}
          {posts.length > 0 && hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
              <button
                onClick={() => { const nextPage = page + 1; setPage(nextPage); fetchPosts(nextPage); }}
                style={{
                  background: 'var(--surface-container-high)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 200ms ease',
                }}
              >
                Load More Posts
              </button>
            </div>
          )}
        </section>

        {/* ── Right Sidebar: Events & Spotlights ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upcoming Events */}
          <div style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: '0.875rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              Upcoming Events
              <span style={{ fontSize: '0.625rem', color: 'var(--primary)', fontWeight: 500, textTransform: 'none', letterSpacing: 0, cursor: 'pointer' }}>See All</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { month: 'Nov', day: '12', title: 'Winter Arts Gala', time: '7:00 PM • Main Hall', featured: true },
                { month: 'Nov', day: '15', title: 'Intro to AI Seminar', time: '2:00 PM • Tech Hub', featured: false },
              ].map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: ev.featured ? 'var(--primary-fixed)' : 'var(--surface-container-high)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                      color: ev.featured ? 'var(--on-primary-fixed-variant)' : 'var(--outline)',
                    }}>{ev.month}</span>
                    <span style={{
                      fontSize: '1.125rem', fontWeight: 700,
                      color: ev.featured ? 'var(--primary)' : 'var(--on-surface-variant)',
                      lineHeight: 1,
                    }}>{ev.day}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{ev.title}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--outline)', margin: 0, marginTop: 2 }}>{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty Spotlights */}
          <div style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700, fontSize: '0.875rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '1rem',
            }}>Faculty Spotlights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Prof. Alan Smith', dept: 'Department of Physics', initials: 'AS' },
                { name: 'Dr. Elena Rodriguez', dept: 'Modern Languages', initials: 'ER' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--secondary-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--on-secondary-container)',
                  }}>{f.initials}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>{f.name}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--outline)', margin: 0, marginTop: 2 }}>{f.dept}</p>
                  </div>
                  <button style={{
                    padding: 6, background: 'var(--surface-container-low)',
                    borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p style={{
            fontSize: '0.625rem', color: 'var(--outline)',
            textAlign: 'center', textTransform: 'uppercase',
            letterSpacing: '0.1em', lineHeight: 2,
            padding: '0 0.5rem',
          }}>
            © 2024 CampusHUB • Privacy • Terms
          </p>
        </aside>
      </div>
    </Layout>
  );
}