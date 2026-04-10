import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import FacultyRoute from './components/FacultyRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student protected routes — will add pages in Phase 2 */}
          <Route path="/feed" element={
            <PrivateRoute><Feed /></PrivateRoute>
          } />

          {/* Faculty protected routes — will add pages in Phase 3 */}
          <Route path="/faculty/dashboard" element={
            <FacultyRoute><div style={{padding:'2rem'}}>Faculty dashboard coming in Phase 3</div></FacultyRoute>
          } />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}