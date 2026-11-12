import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const card = { border: '1px solid #444', borderRadius: 8, padding: 16, minWidth: 160 };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'tutor') return;
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load dashboard'));
  }, [user]);

  if (user?.role !== 'tutor') {
    return (
      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Welcome, {user?.name}</h1>
        <p>Your student and parent views are coming soon.</p>
      </div>
    );
  }

  if (error) return <p style={{ color: 'red', padding: 24 }}>{error}</p>;
  if (!stats) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={card}>
          <h3>Active students</h3>
          <p style={{ fontSize: 28, margin: 0 }}>{stats.totalStudents}</p>
        </div>
        <div style={card}>
          <h3>Sessions today</h3>
          <p style={{ fontSize: 28, margin: 0 }}>{stats.sessionsToday}</p>
        </div>
        <div style={card}>
          <h3>Attendance this month</h3>
          <p style={{ margin: 0 }}>
            Present: {stats.attendance.present}<br />
            Absent: {stats.attendance.absent}<br />
            Late: {stats.attendance.late}
          </p>
        </div>
        <div style={card}>
          <h3>Fees ({stats.fees.month})</h3>
          <p style={{ margin: 0 }}>
            Billed: {stats.fees.billed}<br />
            Collected: {stats.fees.collected}<br />
            Pending: {stats.fees.pending}
          </p>
        </div>
        <div style={card}>
          <h3>Assignments</h3>
          <p style={{ margin: 0 }}>
            Overdue: {stats.assignments.overdue}<br />
            To grade: {stats.assignments.toGrade}
          </p>
        </div>
      </div>

      <h2>Upcoming sessions</h2>
      {stats.upcoming.length === 0 ? (
        <p>No upcoming sessions.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Date and time</th>
            </tr>
          </thead>
          <tbody>
            {stats.upcoming.map((s) => (
              <tr key={s._id}>
                <td>{s.student?.name}</td>
                <td>{s.subject}</td>
                <td>{new Date(s.startTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
