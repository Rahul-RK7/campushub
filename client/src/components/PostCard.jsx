import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.map(String).includes(String(user?._id)));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      const { data } = await api.patch(`/api/posts/${post._id}/like`);
      setLikes(data.likes);
      setLiked(data.liked);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    }
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

  const timeAgo = (dateStr) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <article className="animate-fadeIn" style={{
      background: 'var(--surface-container-lowest)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-whisper)',
      marginBottom: '1.5rem',
      borderLeft: isAnnouncement ? '4px solid var(--tertiary-container)' : 'none',
    }}>
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* Avatar */}
            <div style={{
              width: 48, height: 48,
              borderRadius: isAnnouncement ? 'var(--radius-xl)' : '50%',
              background: isAnnouncement ? 'var(--tertiary-fixed)' : 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {isAnnouncement ? (
                <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: 22 }}>school</span>
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700, fontSize: '1rem', lineHeight: 1.3,
                color: 'var(--on-surface)', margin: 0,
              }}>
                {post.author?.name}
              </h3>
              <p style={{
                fontSize: '0.75rem', color: 'var(--outline)', margin: 0,
              }}>
                {post.author?.role === 'faculty' ? 'Faculty' : 'Student'} • {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAnnouncement && (
              <span style={{
                background: 'var(--tertiary-fixed)',
                color: 'var(--on-tertiary-fixed-variant)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.625rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Announcement
              </span>
            )}
            {(isOwner || isFaculty) && (
              <button onClick={handleDelete} style={{
                background: 'transparent', border: 'none', padding: 4,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}>
                <span className="material-symbols-outlined" style={{
                  color: 'var(--outline)', fontSize: 20,
                  transition: 'color 150ms ease',
                }}
                  onMouseOver={e => e.target.style.color = 'var(--error)'}
                  onMouseOut={e => e.target.style.color = 'var(--outline)'}
                >delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p style={{
          fontSize: '0.875rem', color: 'var(--on-surface-variant)',
          lineHeight: 1.7, margin: '0 0 1rem',
        }}>
          {post.content}
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(200,196,213,0.1)',
        }}>
          <button onClick={handleLike} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: liked ? 'var(--primary)' : 'var(--on-surface-variant)',
            fontWeight: 600, fontSize: '0.75rem',
            padding: 0,
            transition: 'all 150ms ease',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: 20,
              fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
            }}>favorite</span>
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button onClick={loadComments} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: showComments ? 'var(--primary)' : 'var(--on-surface-variant)',
            fontWeight: 600, fontSize: '0.75rem',
            padding: 0,
            transition: 'all 150ms ease',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chat_bubble</span>
            <span>{showComments ? 'Hide' : ''} Comments</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{
          padding: '0 1.5rem 1.5rem',
          borderTop: '1px solid rgba(200,196,213,0.1)',
        }}>
          <div style={{
            marginTop: '1rem', paddingLeft: '1rem',
            borderLeft: '2px solid var(--surface-variant)',
          }}>
            {comments.length === 0 && (
              <p style={{
                fontSize: '0.75rem', color: 'var(--outline)',
                padding: '0.5rem 0',
              }}>No comments yet — be the first!</p>
            )}
            {comments.map(c => (
              <div key={c._id} style={{
                display: 'flex', gap: '0.75rem', marginBottom: '0.75rem',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--surface-container-high)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)',
                  flexShrink: 0,
                }}>
                  {c.author?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '0.75rem',
                  flex: 1,
                }}>
                  <p style={{
                    fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    margin: '0 0 0.25rem',
                  }}>{c.author?.name}</p>
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--on-surface-variant)',
                    margin: 0, lineHeight: 1.5,
                  }}>{c.content}</p>
                </div>
              </div>
            ))}
            {/* Reply input */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                placeholder="Write a reply..."
                style={{
                  flex: 1,
                  background: 'var(--surface-container-low)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}