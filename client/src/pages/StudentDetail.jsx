import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const show = (v, suffix = '') => (v === null || v === undefined ? '-' : `${v}${suffix}`);

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/students/${id}`),
      api.get('/sessions', { params: { student: id } }),
      api.get(`/reports/student/${id}`),
    ])
      .then(([st, se, re]) => {
        setStudent(st.data);
        setSessions(se.data);
        setReport(re.data);
      })
      .catch(() => setError('Could not load student'));
  }, [id]);

  if (error) return <p style={{ color: 'red', padding: 24 }}>{error}</p>;
  if (!student || !report) return <p style={{ padding: 24 }}>Loading...</p>;

  const count = (a) => sessions.filter((s) => s.attendance === a).length;
  const { attendance, assignments, fees } = report;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <p><Link to="/students">Back to students</Link></p>
      <h1>{student.name}</h1>
      <p>
        Grade: {student.grade || '-'}<br />
        Parent: {student.parentName || '-'}<br />
        Monthly fee: {student.monthlyFee}
      </p>

      <h2>Progress</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ border: '1px solid #888', padding: 12, minWidth: 200 }}>
          <strong>Attendance</strong>
          <p style={{ margin: '8px 0 0' }}>Rate: {show(attendance.rate, '%')}</p>
        </div>
        <div style={{ border: '1px solid #888', padding: 12, minWidth: 200 }}>
          <strong>Assignments</strong>
          <p style={{ margin: '8px 0 0' }}>
            Average: {show(assignments.averagePercent, '%')}<br />
            Graded: {assignments.graded}/{assignments.total}<br />
            Overdue: {assignments.overdue}
          </p>
        </div>
        <div style={{ border: '1px solid #888', padding: 12, minWidth: 200 }}>
          <strong>Fees</strong>
          <p style={{ margin: '8px 0 0' }}>
            Billed: {fees.billed}<br />
            Paid: {fees.paid}<br />
            Pending: {fees.pending}
          </p>
        </div>
      </div>

      <h2>Attendance</h2>
      <p>
        Present: {count('present')} | Absent: {count('absent')} | Late: {count('late')} | Unmarked: {count('unmarked')}
      </p>

      <h2>Sessions</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Date and time</th>
            <th>Status</th>
            <th>Attendance</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s._id}>
              <td>{s.subject}</td>
              <td>{new Date(s.startTime).toLocaleString()}</td>
              <td>{s.status}</td>
              <td>{s.attendance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
