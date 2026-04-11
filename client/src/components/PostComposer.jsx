import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PostComposer({ onPost }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [type, setType] = useState('post');
  const [loading, setLoading] = useState(false);

  const isFaculty = user?.role === 'faculty';

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/posts', { content, type });
      onPost(data.post);
      setContent('');
      setType('post');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post');
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: 'var(--surface-container-lowest)',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-whisper)',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#fff',
          overflow: 'hidden',
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {/* Textarea */}
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={isFaculty ? "Post an update or announcement..." : "Share something with the campus..."}
            maxLength={500}
            rows={3}
            style={{
              width: '100%',
              background: 'var(--surface-container-low)',
              border: 'none', outline: 'none',
              borderRadius: 'var(--radius-xl)',
              padding: '1rem',
              fontSize: '0.875rem',
              fontFamily: "'Inter', sans-serif",
              resize: 'none',
              color: 'var(--on-surface)',
              lineHeight: 1.6,
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                fontSize: '0.625rem', fontWeight: 700, color: 'var(--outline)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {content.length} / 500 characters
              </span>
              {isFaculty && (
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.625rem', fontWeight: 700,
                  color: type === 'announcement' ? 'var(--on-tertiary-fixed-variant)' : 'var(--outline)',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: type === 'announcement' ? 'var(--tertiary-fixed)' : 'transparent',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  transition: 'all 150ms ease',
                }}>
                  <input
                    type="checkbox"
                    checked={type === 'announcement'}
                    onChange={e => setType(e.target.checked ? 'announcement' : 'post')}
                    style={{ display: 'none' }}
                  />
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>campaign</span>
                  Announcement
                </label>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--on-primary)',
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--radius-xl)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !content.trim() ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(59, 48, 158, 0.15)',
                transition: 'all 150ms ease',
              }}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}