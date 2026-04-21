import { useState, useEffect, useRef } from 'react';

export default function StoryViewer({ storyGroup, onClose, onNextUser, onPrevUser }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);

    const STO_DURATION = 5000;

    const stories = storyGroup.stories;
    const currentStory = stories[currentIndex];

    // Disable body scroll when open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Progress timer
    useEffect(() => {
        setProgress(0);
        const startTime = Date.now();

        timerRef.current = setInterval(() => {
            const passed = Date.now() - startTime;
            const newProgress = (passed / STO_DURATION) * 100;

            if (newProgress >= 100) {
                clearInterval(timerRef.current);
                handleNext();
            } else {
                setProgress(newProgress);
            }
        }, 50);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, storyGroup]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            if (onNextUser) onNextUser();
            else onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            if (onPrevUser) onPrevUser();
            else onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: '#111', zIndex: 9999, display: 'flex',
            flexDirection: 'column', color: '#fff'
        }}>
            {/* Progress Bars */}
            <div style={{
                position: 'absolute', top: 16, left: 16, right: 16,
                display: 'flex', gap: 6, zIndex: 10
            }}>
                {stories.map((s, i) => (
                    <div key={s._id} style={{
                        flex: 1, height: 3, background: 'rgba(255,255,255,0.3)',
                        borderRadius: 2, overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%', background: '#fff',
                            width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                        }} />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div style={{
                position: 'absolute', top: 32, left: 16, right: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {storyGroup.user.profilePic ?
                            <img src={storyGroup.user.profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontWeight: 700, fontSize: 16 }}>{storyGroup.user.name.charAt(0).toUpperCase()}</span>}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                        {storyGroup.user.name}
                    </span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 20 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>close</span>
                </button>
            </div>

            {/* Media */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                {currentStory.mediaType === 'video' ? (
                    <video src={currentStory.mediaUrl} autoPlay muted playsInline style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                    <img src={currentStory.mediaUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                )}

                {/* Click areas */}
                <div onClick={handlePrev} style={{ position: 'absolute', top: '15%', left: 0, bottom: '15%', width: '30%', cursor: 'pointer', zIndex: 5 }} />
                <div onClick={(e) => { e.stopPropagation(); handleNext(); }} style={{ position: 'absolute', top: '15%', right: 0, bottom: '15%', width: '70%', cursor: 'pointer', zIndex: 5 }} />
            </div>
        </div>
    );
}
