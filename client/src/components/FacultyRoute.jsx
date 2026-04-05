import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FacultyRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'faculty') return <Navigate to="/feed" />;
  return children;
}