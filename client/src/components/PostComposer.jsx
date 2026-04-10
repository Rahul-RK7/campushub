import { useState } from 'react';
import api from '../api/axios';

export default function PostComposer({ onPost }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/posts', { content });
      onPost(data.post);
      setContent('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post');
    }
    setLoading(false);
  };

  return (
    <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={500}
        rows={3}
        style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 14, fontFamily: 'inherit' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{content.length}/500</span>
        <button onClick={handleSubmit} disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}