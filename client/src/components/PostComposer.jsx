import { useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const IMAGE_MAX = 5 * 1024 * 1024;   // 5 MB
const VIDEO_MAX = 25 * 1024 * 1024;  // 25 MB
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];

export default function PostComposer({ onPost }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [type, setType] = useState('post');
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaError, setMediaError] = useState('');
  const fileRef = useRef(null);

  const isFaculty = user?.role === 'faculty';

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaError('');

    const isImage = ALLOWED_IMAGE.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);

    if (!isImage && !isVideo) {
      setMediaError('Unsupported format. Use JPEG, PNG, GIF, WebP, MP4, WebM, or MOV.');
      return;
    }
    if (isImage && file.size > IMAGE_MAX) {
      setMediaError(`Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`);
      return;
    }
    if (isVideo && file.size > VIDEO_MAX) {
      setMediaError(`Video too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 25 MB.`);
      return;
    }

    setMediaFile(file);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;
    setLoading(true);
    try {
      let res;
      if (mediaFile) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('type', type);
        formData.append('media', mediaFile);
        res = await api.post('/api/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/api/posts', { content, type });
      }
      onPost(res.data.post);
      setContent('');
      setType('post');
      removeMedia();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post');
    }
    setLoading(false);
  };

  const isVideoFile = mediaFile?.type?.startsWith('video/');

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
          {user?.profilePic ? (
            <img src={user.profilePic} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        {/* Content area */}
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

          {/* Media Preview */}
          {mediaPreview && (
            <div style={{
              position: 'relative', marginTop: '0.75rem',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              background: 'var(--surface-container-low)',
              border: '1px solid rgba(200,196,213,0.15)',
            }}>
              {isVideoFile ? (
                <video
                  src={mediaPreview}
                  controls
                  style={{ width: '100%', maxHeight: 300, display: 'block', objectFit: 'contain', background: '#000' }}
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: 300, display: 'block', objectFit: 'contain' }}
                />
              )}
              <button
                onClick={removeMedia}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.65)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', fontSize: 16,
                  transition: 'background 150ms ease',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(220,50,50,0.85)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
                title="Remove media"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
              {/* File size badge */}
              <span style={{
                position: 'absolute', bottom: 8, left: 8,
                background: 'rgba(0,0,0,0.6)', color: '#fff',
                fontSize: '0.625rem', fontWeight: 700,
                padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.04em',
              }}>
                {(mediaFile.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          )}

          {/* Error message */}
          {mediaError && (
            <p style={{
              color: 'var(--error, #dc3545)', fontSize: '0.75rem', fontWeight: 600,
              margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              {mediaError}
            </p>
          )}

          {/* Actions bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {/* Photo button */}
              <button
                onClick={() => { fileRef.current.accept = 'image/jpeg,image/png,image/gif,image/webp'; fileRef.current.click(); }}
                title="Add photo (max 5 MB)"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                  color: 'var(--primary)', fontSize: '0.625rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  transition: 'all 150ms ease',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>image</span>
                Photo
              </button>
              {/* Video button */}
              <button
                onClick={() => { fileRef.current.accept = 'video/mp4,video/webm,video/quicktime'; fileRef.current.click(); }}
                title="Add video (max 25 MB)"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                  color: 'var(--tertiary, var(--primary))', fontSize: '0.625rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  transition: 'all 150ms ease',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>videocam</span>
                Video
              </button>

              <span style={{
                fontSize: '0.625rem', fontWeight: 700, color: 'var(--outline)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {content.length} / 500
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
              disabled={loading || (!content.trim() && !mediaFile)}
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--on-primary)',
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--radius-xl)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: loading || (!content.trim() && !mediaFile) ? 'not-allowed' : 'pointer',
                opacity: loading || (!content.trim() && !mediaFile) ? 0.5 : 1,
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