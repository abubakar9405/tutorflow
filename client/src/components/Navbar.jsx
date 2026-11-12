import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: 16, padding: '12px 24px', borderBottom: '1px solid #444', alignItems: 'center' }}>
      <strong>TutorFlow</strong>
      {user ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/students">Students</Link>
          <Link to="/sessions">Sessions</Link>
          <Link to="/fees">Fees</Link>
          <span style={{ marginLeft: 'auto' }}>{user.name} ({user.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}