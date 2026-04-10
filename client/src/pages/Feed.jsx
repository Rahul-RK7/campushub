import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import Layout from '../components/Layout';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (p = 1) => {
    const { data } = await api.get('/api/posts?page=' + p);
    setPosts(prev => p === 1 ? data.posts : [...prev, ...data.posts]);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(1); }, []);

  const onNewPost = (post) => setPosts(prev => [post, ...prev]);

  if (loading) return (
    <Layout>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4rem', color: 'var(--color-text-tertiary)',
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <PostComposer onPost={onNewPost} />
        {posts.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: 'var(--color-text-tertiary)',
          }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>✨</p>
            <p style={{ fontSize: 15, fontWeight: 500 }}>No posts yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Be the first to share something!</p>
          </div>
        )}
        {posts.map(p => (
          <PostCard key={p._id} post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} />
        ))}
        <button onClick={() => { fetchPosts(page + 1); setPage(p => p + 1); }}
          style={{
            width: '100%', marginTop: '0.5rem',
            fontSize: 13, color: 'var(--color-text-tertiary)',
          }}>
          Load more
        </button>
      </div>
    </Layout>
  );
}