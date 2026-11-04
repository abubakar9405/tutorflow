import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: 16, padding: '12px 24px', borderBottom: '1px solid #444' }}>
      <strong>TutorFlow</strong>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/students">Students</Link>
      <Link to="/sessions">Sessions</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}