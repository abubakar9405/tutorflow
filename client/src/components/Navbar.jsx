import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <strong className="brand">TutorFlow</strong>
      {user ? (
        <>
          {user.role === 'tutor' ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/students">Students</NavLink>
              <NavLink to="/sessions">Sessions</NavLink>
              <NavLink to="/fees">Fees</NavLink>
              <NavLink to="/assignments">Assignments</NavLink>
            </>
          ) : (
            <NavLink to="/dashboard">{user.role === 'parent' ? 'My Children' : 'My Portal'}</NavLink>
          )}
          <span className="spacer">{user.name} ({user.role})</span>
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
