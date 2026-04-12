import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header style={{
            position: 'fixed', top: 0, width: '100%', zIndex: 50,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 1.5rem', height: 64,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
            {/* Left: Logo + Nav Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/feed" style={{
                    fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em',
                    color: 'var(--primary-container)',
                    textDecoration: 'none',
                    fontFamily: "'Manrope', sans-serif",
                }}>
                    CampusHUB
                </Link>
                <nav style={{ display: 'flex', gap: '1.5rem' }}>
                    {[
                        { path: '/feed', label: 'Feed' },
                        ...(user?.role === 'faculty' ? [{ path: '/faculty/dashboard', label: 'Faculty Dashboard' }] : []),
                        { path: '/profile', label: 'Profile' },
                    ].map(link => (
                        <Link key={link.path} to={link.path} style={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: isActive(link.path) ? 'var(--primary-container)' : 'var(--outline)',
                            textDecoration: 'none',
                            paddingBottom: 4,
                            borderBottom: isActive(link.path) ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 150ms ease',
                        }}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right: Search + Notifications + Profile + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Search */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    background: 'var(--surface-container-low)',
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                }}>
                    <span className="material-symbols-outlined" style={{
                        fontSize: 16, color: 'var(--outline)', marginRight: 6,
                    }}>search</span>
                    <input
                        type="text"
                        placeholder="Search campus..."
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            fontSize: '0.8125rem', width: 160, padding: '0.25rem 0',
                            color: 'var(--on-surface)',
                        }}
                    />
                </div>

                {/* Notifications */}
                <button onClick={() => { }} style={{
                    background: 'transparent', border: 'none', padding: 8,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 150ms ease',
                }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                    <span className="material-symbols-outlined" style={{
                        color: 'var(--on-surface-variant)', fontSize: 22,
                    }}>notifications</span>
                </button>

                {/* Divider + User */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    paddingLeft: '0.5rem', borderLeft: '1px solid rgba(200,196,213,0.2)',
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff',
                        overflow: 'hidden',
                    }}>
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            user?.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                    </div>
                    <button onClick={handleLogout} style={{
                        background: 'transparent', border: 'none',
                        fontSize: '0.6875rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--outline)', cursor: 'pointer',
                        padding: '4px 8px',
                        transition: 'color 150ms ease',
                    }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--outline)'}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
