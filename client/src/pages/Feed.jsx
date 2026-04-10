import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';

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

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      <PostComposer onPost={onNewPost} />
      {posts.length === 0 && <p style={{textAlign:'center',color:'var(--color-text-secondary)'}}>No posts yet. Be the first!</p>}
      {posts.map(p => <PostCard key={p._id} post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} />)}
      <button onClick={() => { fetchPosts(page+1); setPage(p=>p+1); }}
        style={{width:'100%',marginTop:'1rem'}}>Load more</button>
    </div>
  );
}