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
      const { data } = await api.get(`/api/posts/${post._id}/comments`);
      setComments(data.comments);
    }
    setShowComments(!showComments);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await api.post(`/api/posts/${post._id}/comments`, { content: commentText });
    setComments(prev => [...prev, data.comment]);
    setCommentText('');
  };

  const isAnnouncement = post.type === 'announcement';
  const isOwner = user?._id === post.author?._id;
  const isFaculty = user?.role === 'faculty';

  return (
    <div style={{
      border: `0.5px solid ${isAnnouncement ? '#BA7517' : 'var(--color-border-tertiary)'}`,
      borderLeft: isAnnouncement ? '3px solid #BA7517' : '0.5px solid var(--color-border-tertiary)',
      borderRadius: 12,
      padding: '1rem',
      marginBottom: '0.75rem',
      background: isAnnouncement ? '#FAEEDA20' : 'var(--color-background-primary)'
    }}>
      {isAnnouncement && (
        <span style={{ fontSize: 11, fontWeight: 500, color: '#854F0B', background: '#FAEEDA', padding: '2px 8px', borderRadius: 4, marginBottom: 8, display: 'inline-block' }}>
          Announcement
        </span>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{post.author?.name}</p>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        {(isOwner || isFaculty) && (
          <button onClick={handleDelete} style={{ fontSize: 12, color: 'var(--color-text-danger)', border: 'none', background: 'none', cursor: 'pointer' }}>
            Delete
          </button>
        )}
      </div>

      <p style={{ fontSize: 14, margin: '0.75rem 0', lineHeight: 1.6 }}>{post.content}</p>

      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--color-text-secondary)' }}>
        <button onClick={handleLike} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: liked ? '#534AB7' : 'var(--color-text-secondary)', fontWeight: liked ? 500 : 400 }}>
          {liked ? 'Liked' : 'Like'} {likes > 0 && `(${likes})`}
        </button>
        <button onClick={loadComments} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Comments
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: '0.75rem', borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '0.75rem' }}>
          {comments.length === 0 && <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>No comments yet</p>}
          {comments.map(c => (
            <div key={c._id} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{c.author?.name}: </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{c.content}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..." style={{ flex: 1, fontSize: 12 }} />
            <button onClick={addComment} style={{ fontSize: 12 }}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}