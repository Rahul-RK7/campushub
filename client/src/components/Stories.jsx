import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StoryViewer from './StoryViewer';

export default function Stories() {
    const { user } = useAuth();
    const [storyGroups, setStoryGroups] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchStories = async () => {
        try {
            const { data } = await api.get('/api/stories');
            setStoryGroups(data);
        } catch (err) {
            console.error('Failed to fetch stories:', err);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('media', file);

        setUploading(true);
        try {
            await api.post('/api/stories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchStories(); // Refresh stories
        } catch (err) {
            console.error('Failed to upload story:', err);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = null; // reset
        }
    };

    const hasMyStory = storyGroups.length > 0 && storyGroups[0].user._id === user._id;

    return (
        <div style={{
            background: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex', gap: '1.25rem', overflowX: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
        }}>
            <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} />

            {/* My Story Button (if none) */}
            {!hasMyStory && (
                <div onClick={() => !uploading && fileInputRef.current.click()} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1,
                    flexShrink: 0
                }}>
                    <div style={{
                        width: 68, height: 68, borderRadius: '50%',
                        background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', border: '1px solid var(--outline-variant)'
                    }}>
                        <div style={{
                            width: 62, height: 62, borderRadius: '50%',
                            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', color: '#fff', fontWeight: 700, fontSize: 24
                        }}>
                            {user?.profilePic ?
                                <img src={user.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{
                            position: 'absolute', bottom: -2, right: -2, width: 24, height: 24,
                            background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', border: '3px solid var(--surface-container-lowest)'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Your Story</span>
                </div>
            )}

            {/* Story Groups */}
            {storyGroups.map((group, idx) => (
                <div key={group.user._id} onClick={() => setViewerIndex(idx)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer',
                    flexShrink: 0
                }}>
                    <div style={{
                        width: 68, height: 68, borderRadius: '50%',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 3
                    }}>
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            background: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 2
                        }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                                background: 'var(--gradient-primary)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: 24
                            }}>
                                {group.user.profilePic ?
                                    <img src={group.user.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : group.user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <span style={{
                        fontSize: '0.6875rem', fontWeight: 500, color: 'var(--on-surface-variant)',
                        maxWidth: 75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                        {group.user._id === user._id ? 'Your Story' : group.user.name}
                    </span>
                </div>
            ))}

            {viewerIndex !== null && (
                <StoryViewer
                    storyGroup={storyGroups[viewerIndex]}
                    onClose={() => setViewerIndex(null)}
                    onNextUser={() => viewerIndex < storyGroups.length - 1 ? setViewerIndex(viewerIndex + 1) : setViewerIndex(null)}
                    onPrevUser={() => viewerIndex > 0 ? setViewerIndex(viewerIndex - 1) : setViewerIndex(null)}
                />
            )}

            <style>{`
                ::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
