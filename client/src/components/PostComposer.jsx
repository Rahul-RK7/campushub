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
      background: 'var(--gradient-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      marginBottom: '1rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--gradient-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={isFaculty ? "Share a post or announcement..." : "What's on your mind?"}
          maxLength={500}
          rows={3}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            fontSize: 14, fontFamily: 'inherit',
            background: 'transparent', color: 'var(--color-text)',
          }}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12, paddingTop: 12,
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{content.length}/500</span>
          {isFaculty && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 500,
              color: type === 'announcement' ? 'var(--color-announcement)' : 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: type === 'announcement' ? 'var(--color-announcement-subtle)' : 'transparent',
              border: type === 'announcement' ? '1px solid var(--color-announcement-border)' : '1px solid transparent',
              transition: 'all var(--transition-fast)',
            }}>
              <input
                type="checkbox"
                checked={type === 'announcement'}
                onChange={e => setType(e.target.checked ? 'announcement' : 'post')}
                style={{ display: 'none' }}
              />
              📢 Announcement
            </label>
          )}
        </div>
        <button onClick={handleSubmit} className="btn-primary"
          style={{ fontSize: 13, padding: '8px 24px' }}
          disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}