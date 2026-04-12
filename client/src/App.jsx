import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import FacultyRoute from './components/FacultyRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';
import FacultyDashboard from './pages/FacultyDashboard';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/feed" element={
              <PrivateRoute><Feed /></PrivateRoute>
            } />
            <Route path="/messages" element={
              <PrivateRoute><Messages /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/profile/:id" element={
              <PrivateRoute><UserProfile /></PrivateRoute>
            } />

            {/* Faculty protected routes */}
            <Route path="/faculty/dashboard" element={
              <FacultyRoute><FacultyDashboard /></FacultyRoute>
            } />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}