import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import Layout from '../components/Layout';

/* ───────────────────── helpers ───────────────────── */
const timeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
};

const Avatar = ({ name, pic, size = 40, online }) => (
    <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 700, color: '#fff',
            overflow: 'hidden',
        }}>
            {pic
                ? <img src={pic} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {online && (
            <div style={{
                position: 'absolute', bottom: 1, right: 1,
                width: size * 0.28, height: size * 0.28, borderRadius: '50%',
                background: '#22c55e', border: '2px solid var(--surface-container-lowest)',
            }} />
        )}
    </div>
);

/* ───────────────────── main component ───────────────────── */
export default function Messages() {
    const { user } = useAuth();
    const { socket, onlineUsers } = useSocket();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [showNewChat, setShowNewChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const chatContainerRef = useRef(null);
    const activeConvIdRef = useRef(null);

    // Clean up typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    // Keep ref in sync with activeConv so socket handlers always see latest value
    useEffect(() => {
        activeConvIdRef.current = activeConv?._id || null;
    }, [activeConv?._id]);

    // Handle openConversation from navigation (e.g., from UserProfile Message button)
    useEffect(() => {
        if (location.state?.openConversation) {
            const conv = location.state.openConversation;
            setActiveConv(conv);
            setMobileShowChat(true);
            // Persist conversation ID in URL so it survives refresh
            setSearchParams({ conv: conv._id }, { replace: true });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    /* ── fetch conversations ── */
    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/api/messages/conversations');
            setConversations(data);
            return data;
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /* ── fetch unread count ── */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await api.get('/api/messages/unread-count');
            setUnreadCount(data.count);
        } catch (err) { /* silent */ }
    }, []);

    /* ── initial load: restore active conversation from URL ── */
    useEffect(() => {
        const init = async () => {
            const convs = await fetchConversations();
            await fetchUnreadCount();

            // If no conversation set from location.state, try to restore from URL
            const convIdFromUrl = searchParams.get('conv');
            if (convIdFromUrl && !location.state?.openConversation) {
                const match = convs.find(c => c._id === convIdFromUrl);
                if (match) {
                    setActiveConv(match);
                    setMobileShowChat(true);
                }
            }
        };
        init();
    }, []); // Run only on mount

    /* ── fetch messages for active conversation ── */
    useEffect(() => {
        if (!activeConv) return;
        const fetchMessages = async () => {
            setLoadingMsgs(true);
            try {
                const { data } = await api.get(`/api/messages/conversations/${activeConv._id}`);
                setMessages(data.messages);
                // Mark as read
                await api.put(`/api/messages/conversations/${activeConv._id}/read`);
                fetchConversations();
                fetchUnreadCount();
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            } finally {
                setLoadingMsgs(false);
            }
        };
        fetchMessages();
    }, [activeConv?._id]);

    /* ── auto-scroll ── */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ── socket listeners ── */
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = ({ message, conversationId }) => {
            // Use ref to get the latest activeConv ID (avoids stale closure)
            const currentConvId = activeConvIdRef.current;
            if (currentConvId && conversationId === currentConvId) {
                setMessages(prev => [...prev, message]);
                // Auto mark as read
                api.put(`/api/messages/conversations/${conversationId}/read`).catch(() => { });
            }
            // Refresh conversation list
            fetchConversations();
            fetchUnreadCount();
        };

        const handleTyping = ({ userId: typerId, conversationId, isTyping }) => {
            setTypingUsers(prev => ({
                ...prev,
                [conversationId]: isTyping ? typerId : null,
            }));
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('userTyping', handleTyping);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('userTyping', handleTyping);
        };
    }, [socket, fetchConversations, fetchUnreadCount]);

    /* ── join / leave conversation room ── */
    useEffect(() => {
        if (!socket || !activeConv) return;
        socket.emit('joinConversation', activeConv._id);
        return () => socket.emit('leaveConversation', activeConv._id);
    }, [socket, activeConv?._id]);

    /* ── send message ── */
    const handleSend = async () => {
        if (!newMsg.trim() || !activeConv || sending) return;
        setSending(true);
        try {
            const { data } = await api.post(`/api/messages/conversations/${activeConv._id}`, { text: newMsg });
            setMessages(prev => [...prev, data]);
            setNewMsg('');
            fetchConversations();
            // Stop typing indicator
            if (socket) socket.emit('typing', { conversationId: activeConv._id, isTyping: false });
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    /* ── typing indicator emit ── */
    const handleTyping = () => {
        if (!socket || !activeConv) return;
        socket.emit('typing', { conversationId: activeConv._id, isTyping: true });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { conversationId: activeConv._id, isTyping: false });
        }, 2000);
    };

    /* ── search users for new chat ── */
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const delaySearch = setTimeout(async () => {
            setSearchingUsers(true);
            try {
                const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(data.filter(u => u._id !== user?._id));
            } catch (err) {
                console.error('User search failed:', err);
            } finally {
                setSearchingUsers(false);
            }
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, user._id]);

    /* ── start new conversation ── */
    const startConversation = async (participantId) => {
        try {
            const { data } = await api.post('/api/messages/conversations', { participantId });
            setShowNewChat(false);
            setSearchQuery('');
            setSearchResults([]);
            setActiveConv(data);
            setMobileShowChat(true);
            setSearchParams({ conv: data._id }, { replace: true });
            fetchConversations();
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    /* ── get other participant ── */
    const getOtherParticipant = (conv) => {
        return conv.participants?.find(p => p._id !== user._id) || {};
    };

    /* ── compute conversation filter ── */
    const [convSearch, setConvSearch] = useState('');
    const filteredConversations = conversations.filter(c => {
        if (!convSearch.trim()) return true;
        const other = getOtherParticipant(c);
        return other.name?.toLowerCase().includes(convSearch.toLowerCase());
    });

    /* ═══════════════════════════ RENDER ═══════════════════════════ */
    return (
        <Layout>
            <div style={{
                display: 'flex', height: 'calc(100vh - 9rem)',
                background: 'var(--surface-container-lowest)',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--shadow-whisper)',
                overflow: 'hidden',
            }}>

                {/* ═══ LEFT PANEL — Conversation List ═══ */}
                <div style={{
                    width: 360, minWidth: 300,
                    borderRight: '1px solid var(--outline-variant)',
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--surface-container-lowest)',
                    ...(mobileShowChat ? { display: 'none' } : {}),
                }} className="msg-sidebar">

                    {/* Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(200,196,213,0.15)',
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem', fontWeight: 700,
                            fontFamily: "'Manrope', sans-serif",
                            color: 'var(--on-surface)',
                            letterSpacing: '-0.02em', margin: 0,
                        }}>Messages</h2>
                        <button onClick={() => setShowNewChat(true)} style={{
                            background: 'var(--gradient-primary)',
                            color: '#fff', border: 'none', borderRadius: 'var(--radius-full)',
                            width: 36, height: 36, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(59,48,158,0.25)',
                            transition: 'all 150ms ease',
                        }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            title="New message"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit_square</span>
                        </button>
                    </div>

                    {/* Search conversations */}
                    <div style={{ padding: '0.75rem 1.25rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            background: 'var(--surface-container-low)',
                            borderRadius: 'var(--radius-full)',
                            padding: '0.4rem 0.75rem',
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: 18, color: 'var(--outline)', marginRight: 6,
                            }}>search</span>
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={convSearch}
                                onChange={e => setConvSearch(e.target.value)}
                                style={{
                                    background: 'transparent', border: 'none', outline: 'none',
                                    fontSize: '0.8125rem', width: '100%', padding: '0.25rem 0',
                                    color: 'var(--on-surface)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Conversation list */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <div style={{
                                    width: 28, height: 28, border: '3px solid var(--surface-container-high)',
                                    borderTopColor: 'var(--primary)', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div style={{
                                padding: '3rem 1.5rem', textAlign: 'center',
                                color: 'var(--outline)',
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>chat_bubble</span>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>No conversations yet</p>
                                <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Start a new chat to begin messaging</p>
                            </div>
                        ) : (
                            filteredConversations.map(conv => {
                                const other = getOtherParticipant(conv);
                                const isActive = activeConv?._id === conv._id;
                                const isOnline = onlineUsers.includes(other._id);
                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => { setActiveConv(conv); setMobileShowChat(true); setSearchParams({ conv: conv._id }, { replace: true }); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.875rem 1.25rem', cursor: 'pointer',
                                            background: isActive ? 'var(--primary-fixed)' : 'transparent',
                                            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                            transition: 'all 150ms ease',
                                        }}
                                        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-container-low)'; }}
                                        onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Avatar name={other.name} pic={other.profilePic} size={44} online={isOnline} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{
                                                    fontWeight: conv.unreadCount > 0 ? 700 : 500,
                                                    fontSize: '0.875rem', color: 'var(--on-surface)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>{other.name}</span>
                                                <span style={{
                                                    fontSize: '0.6875rem', color: 'var(--outline)',
                                                    flexShrink: 0, marginLeft: 8,
                                                }}>
                                                    {conv.lastMessage ? timeAgo(conv.lastMessage.createdAt || conv.updatedAt) : ''}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: conv.unreadCount > 0 ? 'var(--on-surface)' : 'var(--outline)',
                                                    fontWeight: conv.unreadCount > 0 ? 600 : 400,
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    maxWidth: '85%',
                                                }}>
                                                    {typingUsers[conv._id]
                                                        ? <em style={{ color: 'var(--primary)' }}>typing...</em>
                                                        : conv.lastMessage?.text || 'No messages yet'}
                                                </span>
                                                {conv.unreadCount > 0 && (
                                                    <span style={{
                                                        background: 'var(--gradient-primary)',
                                                        color: '#fff', borderRadius: 'var(--radius-full)',
                                                        fontSize: '0.625rem', fontWeight: 700,
                                                        minWidth: 20, height: 20, display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        padding: '0 6px', flexShrink: 0,
                                                    }}>
                                                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT PANEL — Chat View ═══ */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    background: 'var(--surface-container-low)',
                    ...(!mobileShowChat && !activeConv ? {} : {}),
                }} className="msg-chat">
                    {!activeConv ? (
                        /* Empty state */
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'var(--outline)',
                        }}>
                            <div style={{
                                width: 88, height: 88, borderRadius: '50%',
                                background: 'var(--surface-container)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16,
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--outline-variant)' }}>forum</span>
                            </div>
                            <p style={{ fontSize: '1.125rem', fontWeight: 600, fontFamily: "'Manrope', sans-serif", color: 'var(--on-surface-variant)' }}>Your Messages</p>
                            <p style={{ fontSize: '0.8125rem', marginTop: 4, color: 'var(--outline)' }}>Select a conversation or start a new one</p>
                            <button onClick={() => setShowNewChat(true)} className="btn-primary" style={{
                                marginTop: 20, padding: '0.625rem 1.5rem', fontSize: '0.8125rem',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                                New Message
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.875rem 1.5rem',
                                borderBottom: '1px solid rgba(200,196,213,0.15)',
                                background: 'rgba(255,255,255,0.6)',
                                backdropFilter: 'blur(12px)',
                            }}>
                                <button
                                    onClick={() => { setMobileShowChat(false); setActiveConv(null); setSearchParams({}, { replace: true }); }}
                                    className="msg-back-btn"
                                    style={{
                                        background: 'transparent', border: 'none', padding: 4,
                                        display: 'none', cursor: 'pointer',
                                        color: 'var(--on-surface-variant)',
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
                                </button>
                                <Avatar
                                    name={getOtherParticipant(activeConv).name}
                                    pic={getOtherParticipant(activeConv).profilePic}
                                    size={38}
                                    online={onlineUsers.includes(getOtherParticipant(activeConv)._id)}
                                />
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--on-surface)', margin: 0 }}>
                                        {getOtherParticipant(activeConv).name}
                                    </p>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--outline)', margin: 0 }}>
                                        {typingUsers[activeConv._id]
                                            ? <span style={{ color: 'var(--primary)', fontWeight: 500 }}>typing...</span>
                                            : onlineUsers.includes(getOtherParticipant(activeConv)._id)
                                                ? <span style={{ color: '#22c55e' }}>Online</span>
                                                : 'Offline'}
                                    </p>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div ref={chatContainerRef} style={{
                                flex: 1, overflowY: 'auto', padding: '1rem 1.5rem',
                                display: 'flex', flexDirection: 'column', gap: '0.375rem',
                            }}>
                                {loadingMsgs ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                        <div style={{
                                            width: 28, height: 28, border: '3px solid var(--surface-container-high)',
                                            borderTopColor: 'var(--primary)', borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div style={{
                                        flex: 1, display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--outline)', padding: '2rem',
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.3, marginBottom: 8 }}>waving_hand</span>
                                        <p style={{ fontSize: '0.8125rem' }}>Say hello! Send your first message.</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg, idx) => {
                                            const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                                            const showDate = idx === 0 || (
                                                new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1].createdAt).toDateString()
                                            );
                                            return (
                                                <div key={msg._id}>
                                                    {showDate && (
                                                        <div style={{
                                                            textAlign: 'center', margin: '1rem 0 0.75rem',
                                                            fontSize: '0.6875rem', color: 'var(--outline)',
                                                            fontWeight: 500,
                                                        }}>
                                                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                                                weekday: 'short', month: 'short', day: 'numeric',
                                                            })}
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                        animation: idx === messages.length - 1 ? 'fadeInUp 0.2s ease' : 'none',
                                                    }}>
                                                        <div style={{
                                                            maxWidth: '70%', padding: '0.625rem 1rem',
                                                            borderRadius: isMine
                                                                ? '1.125rem 1.125rem 0.25rem 1.125rem'
                                                                : '1.125rem 1.125rem 1.125rem 0.25rem',
                                                            background: isMine ? 'var(--gradient-primary)' : 'var(--surface-container-lowest)',
                                                            color: isMine ? '#fff' : 'var(--on-surface)',
                                                            boxShadow: isMine
                                                                ? '0 2px 8px rgba(59,48,158,0.15)'
                                                                : '0 1px 3px rgba(0,0,0,0.04)',
                                                            fontSize: '0.8125rem',
                                                            lineHeight: 1.5,
                                                            wordBreak: 'break-word',
                                                        }}>
                                                            {msg.text}
                                                            <div style={{
                                                                fontSize: '0.625rem', marginTop: 4,
                                                                opacity: 0.7, textAlign: 'right',
                                                            }}>
                                                                {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric', minute: '2-digit',
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Message input */}
                            <div style={{
                                padding: '0.75rem 1.25rem',
                                borderTop: '1px solid rgba(200,196,213,0.15)',
                                background: 'rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(12px)',
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                                    background: 'var(--surface-container)',
                                    borderRadius: 'var(--radius-2xl)',
                                    padding: '0.375rem 0.5rem 0.375rem 1rem',
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMsg}
                                        onChange={e => { setNewMsg(e.target.value); handleTyping(); }}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        style={{
                                            flex: 1, background: 'transparent', border: 'none',
                                            outline: 'none', fontSize: '0.875rem', padding: '0.5rem 0',
                                            color: 'var(--on-surface)',
                                        }}
                                        disabled={sending}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSend}
                                        disabled={!newMsg.trim() || sending}
                                        style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            background: newMsg.trim() ? 'var(--gradient-primary)' : 'var(--surface-container-high)',
                                            color: newMsg.trim() ? '#fff' : 'var(--outline)',
                                            border: 'none', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', cursor: newMsg.trim() ? 'pointer' : 'default',
                                            transition: 'all 200ms ease',
                                            boxShadow: newMsg.trim() ? '0 2px 8px rgba(59,48,158,0.25)' : 'none',
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 20, pointerEvents: 'none' }}>send</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ═══ NEW CHAT MODAL ═══ */}
                {showNewChat && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 100,
                        animation: 'fadeIn 0.2s ease',
                    }} onClick={() => setShowNewChat(false)}>
                        <div onClick={e => e.stopPropagation()} style={{
                            background: 'var(--surface-container-lowest)',
                            borderRadius: 'var(--radius-2xl)',
                            width: '100%', maxWidth: 440, maxHeight: '70vh',
                            display: 'flex', flexDirection: 'column',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                            animation: 'fadeInUp 0.3s ease',
                        }}>
                            {/* Modal header */}
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid rgba(200,196,213,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <h3 style={{
                                    fontSize: '1.0625rem', fontWeight: 700,
                                    fontFamily: "'Manrope', sans-serif",
                                    margin: 0, color: 'var(--on-surface)',
                                }}>New Message</h3>
                                <button onClick={() => setShowNewChat(false)} style={{
                                    background: 'transparent', border: 'none', padding: 4,
                                    cursor: 'pointer', color: 'var(--outline)',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                                </button>
                            </div>

                            {/* Search input */}
                            <div style={{ padding: '1rem 1.5rem' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: 'var(--surface-container-low)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '0.5rem 0.875rem',
                                }}>
                                    <span className="material-symbols-outlined" style={{
                                        fontSize: 18, color: 'var(--outline)', marginRight: 8,
                                    }}>person_search</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        autoFocus
                                        style={{
                                            flex: 1, background: 'transparent', border: 'none',
                                            outline: 'none', fontSize: '0.8125rem', padding: '0.25rem 0',
                                            color: 'var(--on-surface)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Search results */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem 1rem' }}>
                                {searchingUsers ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                                        <div style={{
                                            width: 24, height: 24, border: '3px solid var(--surface-container-high)',
                                            borderTopColor: 'var(--primary)', borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                    </div>
                                ) : searchResults.length === 0 && searchQuery.trim() ? (
                                    <p style={{
                                        textAlign: 'center', color: 'var(--outline)',
                                        fontSize: '0.8125rem', padding: '1.5rem',
                                    }}>No users found</p>
                                ) : (
                                    searchResults.map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => startConversation(u._id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                                                cursor: 'pointer', transition: 'background 150ms ease',
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Avatar name={u.name} pic={u.profilePic} size={40} online={onlineUsers.includes(u._id)} />
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)', margin: 0 }}>{u.name}</p>
                                                <p style={{ fontSize: '0.6875rem', color: 'var(--outline)', margin: 0 }}>{u.department || u.role}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Responsive styles */}
            <style>{`
        @media (max-width: 768px) {
          .msg-sidebar {
            width: 100% !important;
            min-width: unset !important;
            border-right: none !important;
            display: ${mobileShowChat ? 'none' : 'flex'} !important;
          }
          .msg-chat {
            display: ${mobileShowChat || activeConv ? 'flex' : 'none'} !important;
          }
          .msg-back-btn {
            display: flex !important;
          }
        }
      `}</style>
        </Layout>
    );
}
