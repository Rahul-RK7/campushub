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
  const [postCount, setPostCount] = useState(0);
  const [followingList, setFollowingList] = useState([]);

  /* ── Event Calendar state ── */
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', location: '' });
  const [eventSubmitting, setEventSubmitting] = useState(false);

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

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/api/events');
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  useEffect(() => {
    fetchPosts(1);
    fetchEvents();
    api.get('/api/users/me/post-count')
      .then(({ data }) => setPostCount(data.postCount))
      .catch(() => { });
    api.get('/api/users/me')
      .then(({ data }) => setFollowingList((data.following || []).map(f => f._id || f)))
      .catch(() => { });
  }, []);

  const onNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
    setPostCount(prev => prev + 1);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.location) return;
    setEventSubmitting(true);
    try {
      const { data } = await api.post('/api/events', eventForm);
      setEvents(prev => [...prev, data].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setEventForm({ title: '', description: '', date: '', time: '', location: '' });
      setShowEventForm(false);
    } catch (err) {
      console.error('Failed to create event:', err);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.delete('/api/events/' + id);
      setEvents(prev => prev.filter(ev => ev._id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const formatEventDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { month: months[d.getMonth()], day: d.getDate() };
  };

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
              {user?.profilePic ? (
                <img src={user.profilePic} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || '?'
              )}
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
              <div>Posts<br /><span style={{ color: 'var(--on-background)', fontSize: '1rem' }}>{postCount}</span></div>
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
            <PostCard key={p._id} post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} followingList={followingList} />
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

        {/* ── Right Sidebar: Event Calendar ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Event Calendar */}
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>calendar_month</span>
                Event Calendar
              </span>
              {user?.role === 'faculty' && (
                <button
                  id="add-event-btn"
                  onClick={() => setShowEventForm(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px',
                    background: 'var(--primary)',
                    color: 'var(--on-primary)',
                    borderRadius: 'var(--radius-full)',
                    border: 'none', cursor: 'pointer',
                    fontSize: '0.625rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    transition: 'opacity 200ms ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    {showEventForm ? 'close' : 'add'}
                  </span>
                  {showEventForm ? 'Cancel' : 'Add'}
                </button>
              )}
            </h3>

            {/* ── Add Event Form (faculty only) ── */}
            {showEventForm && user?.role === 'faculty' && (
              <form
                onSubmit={handleEventSubmit}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '0.625rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--outline-variant)',
                }}
              >
                <input
                  id="event-title"
                  type="text"
                  placeholder="Event title *"
                  value={eventForm.title}
                  onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
                  style={inputStyle}
                  required
                />
                <textarea
                  id="event-description"
                  placeholder="Description (optional)"
                  value={eventForm.description}
                  onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    id="event-date"
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                    required
                  />
                  <input
                    id="event-time"
                    type="time"
                    value={eventForm.time}
                    onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))}
                    style={inputStyle}
                    required
                  />
                </div>
                <input
                  id="event-location"
                  type="text"
                  placeholder="Location *"
                  value={eventForm.location}
                  onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))}
                  style={inputStyle}
                  required
                />
                <button
                  id="event-submit-btn"
                  type="submit"
                  disabled={eventSubmitting}
                  style={{
                    padding: '0.5rem',
                    background: 'var(--primary)',
                    color: 'var(--on-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.75rem',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    opacity: eventSubmitting ? 0.6 : 1,
                    transition: 'opacity 200ms ease',
                  }}
                >
                  {eventSubmitting ? 'Adding…' : 'Add Event'}
                </button>
              </form>
            )}

            {/* ── Event List ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {events.length === 0 && (
                <p style={{
                  fontSize: '0.75rem', color: 'var(--outline)',
                  textAlign: 'center', padding: '1rem 0', margin: 0,
                }}>No upcoming events</p>
              )}
              {events.map((ev, i) => {
                const { month, day } = formatEventDate(ev.date);
                const isFeatured = i === 0;
                return (
                  <div key={ev._id} style={{
                    display: 'flex', gap: '0.75rem', cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 150ms ease',
                    position: 'relative',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--radius-md)',
                      background: isFeatured ? 'var(--primary-fixed)' : 'var(--surface-container-high)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase',
                        color: isFeatured ? 'var(--on-primary-fixed-variant)' : 'var(--outline)',
                        lineHeight: 1.2,
                      }}>{month}</span>
                      <span style={{
                        fontSize: '1.125rem', fontWeight: 700,
                        color: isFeatured ? 'var(--primary)' : 'var(--on-surface-variant)',
                        lineHeight: 1,
                      }}>{day}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{ev.title}</p>
                      <p style={{ fontSize: '0.625rem', color: 'var(--outline)', margin: 0, marginTop: 2 }}>
                        {ev.time} • {ev.location}
                      </p>
                      {ev.createdBy && (
                        <p style={{ fontSize: '0.5625rem', color: 'var(--outline-variant)', margin: 0, marginTop: 2, fontStyle: 'italic' }}>
                          by {ev.createdBy.name}
                        </p>
                      )}
                    </div>
                    {user?.role === 'faculty' && ev.createdBy && (ev.createdBy._id === user._id || ev.createdBy === user._id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev._id); }}
                        style={{
                          position: 'absolute', top: 4, right: 4,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--error, #d32f2f)',
                          padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 'var(--radius-full)',
                          opacity: 0.6, transition: 'opacity 150ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                        title="Delete event"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                      </button>
                    )}
                  </div>
                );
              })}
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

/* ── Shared input style ── */
const inputStyle = {
  padding: '0.5rem 0.625rem',
  fontSize: '0.75rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--outline-variant)',
  background: 'var(--surface-container-lowest)',
  color: 'var(--on-surface)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};