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

    const navLinkStyle = (path) => ({
        fontSize: 13,
        fontWeight: isActive(path) ? 600 : 400,
        color: isActive(path) ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        background: isActive(path) ? 'var(--color-accent-subtle)' : 'transparent',
        transition: 'all var(--transition-fast)',
    });

    return (
        <nav style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 2rem', height: 56,
            borderBottom: '1px solid var(--color-border)',
            background: 'rgba(15, 15, 19, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            position: 'sticky', top: 0, zIndex: 100,
        }}>
            <Link to="/feed" style={{
                fontWeight: 700, fontSize: 18,
                background: 'var(--gradient-accent)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
                letterSpacing: '-0.02em',
            }}>
                CampusHUB
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link to="/feed" style={navLinkStyle('/feed')}>Feed</Link>
                {user?.role === 'faculty' && (
                    <Link to="/faculty/dashboard" style={navLinkStyle('/faculty/dashboard')}>
                        Faculty Panel
                    </Link>
                )}
                <Link to="/profile" style={navLinkStyle('/profile')}>Profile</Link>

                <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 8px' }} />

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '4px 6px 4px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-bg-elevated)',
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--gradient-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {user?.name}
                    </span>
                    <button onClick={handleLogout} style={{
                        fontSize: 11, padding: '5px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6, background: 'transparent', cursor: 'pointer',
                        color: 'var(--color-text-tertiary)', fontWeight: 500,
                        transition: 'all var(--transition-fast)',
                    }}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
