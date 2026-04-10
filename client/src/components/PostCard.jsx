import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    const { data } = await api.patch(`/api/posts/${post._id}/like`);
    setLikes(data.likes);
    setLiked(data.liked);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/api/posts/${post._id}`);
    onDelete(post._id);
  };

  const loadComments = async () => {
    if (!showComments) {
      const { data } = await api.get(`/api/comments/${post._id}`);
      setComments(data.comments);
    }
    setShowComments(!showComments);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await api.post(`/api/comments/${post._id}`, { content: commentText });
    setComments(prev => [...prev, data.comment]);
    setCommentText('');
  };

  const isAnnouncement = post.type === 'announcement';
  const isOwner = user?._id === post.author?._id;
  const isFaculty = user?.role === 'faculty';

  return (
    <div className="animate-fadeIn" style={{
      background: isAnnouncement ? 'var(--color-announcement-subtle)' : 'var(--gradient-card)',
      border: `1px solid ${isAnnouncement ? 'var(--color-announcement-border)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      marginBottom: '0.75rem',
      transition: 'all var(--transition-normal)',
    }}>
      {/* Announcement badge */}
      {isAnnouncement && (
        <span className="badge badge-warning" style={{ marginBottom: 10 }}>
          📢 Announcement
        </span>
      )}

      {/* Header: author + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: isAnnouncement
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
              {post.author?.name}
              {post.author?.role === 'faculty' && (
                <span className="badge badge-accent" style={{ marginLeft: 8, fontSize: 10 }}>Faculty</span>
              )}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        {(isOwner || isFaculty) && (
          <button onClick={handleDelete} className="btn-ghost" style={{
            fontSize: 12, padding: '4px 10px', color: 'var(--color-text-tertiary)',
          }}>
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize: 14, margin: '0.85rem 0', lineHeight: 1.7, color: 'var(--color-text)' }}>
        {post.content}
      </p>

      {/* Action bar */}
      <div style={{
        display: 'flex', gap: 4, paddingTop: '0.5rem',
        borderTop: '1px solid var(--color-border)',
      }}>
        <button onClick={handleLike} className="btn-ghost" style={{
          fontSize: 13, padding: '6px 14px',
          color: liked ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
          fontWeight: liked ? 600 : 400,
        }}>
          {liked ? '♥' : '♡'} {likes > 0 && likes}
        </button>
        <button onClick={loadComments} className="btn-ghost" style={{
          fontSize: 13, padding: '6px 14px', color: 'var(--color-text-tertiary)',
        }}>
          💬 Comments
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{
          marginTop: '0.75rem', paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {comments.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>No comments yet — be the first!</p>
          )}
          {comments.map(c => (
            <div key={c._id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10,
              padding: '8px 10px',
              background: 'var(--color-bg-input)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--color-bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', flexShrink: 0,
              }}>
                {c.author?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{c.author?.name}</span>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{c.content}</p>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              onKeyDown={e => e.key === 'Enter' && addComment()}
              style={{ flex: 1, fontSize: 13, padding: '8px 12px' }} />
            <button onClick={addComment} className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}