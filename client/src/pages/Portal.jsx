import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadFile } from '../services/download';

const panel = { border: '1px solid #444', padding: 16, marginBottom: 20 };
const safeLink = (u) => (/^https?:\/\//i.test(u || '') ? u : null);
const show = (v, suffix = '') => (v === null || v === undefined ? '-' : `${v}${suffix}`);

export default function Portal() {
  const { user } = useAuth();
  const isParent = user?.role === 'parent';
  const [students, setStudents] = useState(null);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/portal/me')
      .then((res) => {
        setStudents(res.data.students);
        if (res.data.students.length) setSelected(res.data.students[0]._id);
      })
      .catch(() => setError('Could not load your profile'));
  }, []);

  const loadOverview = () =>
    api
      .get(`/portal/students/${selected}/overview`)
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load details'));

  useEffect(() => {
    if (selected) loadOverview();
  }, [selected]);

  const upload = async (a) => {
    setError('');
    setMessage('');
    const file = files[a._id];
    if (!file) {
      setError('Choose a file first');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    try {
      await api.post(`/portal/assignments/${a._id}/upload`, fd);
      setFiles({ ...files, [a._id]: null });
      setMessage('File uploaded');
      loadOverview();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const viewFile = async (a) => {
    try {
      await downloadFile(`/portal/assignments/${a._id}/file`, a.submission.originalName);
    } catch (err) {
      setError('Could not open the file');
    }
  };

  if (error && !students) return <p style={{ color: 'tomato', padding: 24 }}>{error}</p>;
  if (!students) return <p style={{ padding: 24 }}>Loading...</p>;

  if (students.length === 0) {
    return (
      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Welcome, {user?.name}</h1>
        <p>
          No student is linked to {user?.email} yet. Ask your tutor to add this email
          to the student record.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>{isParent ? 'My Children' : 'My Portal'}</h1>

      {students.length > 1 && (
        <p>
          Child:{' '}
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </p>
      )}

      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      {message && <p style={{ color: 'lightgreen' }}>{message}</p>}
      {!data && <p>Loading...</p>}

      {data && (
        <>
          <h2>{data.student.name} ({data.student.grade || '-'})</h2>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ ...panel, marginBottom: 0, minWidth: 180 }}>
              <strong>Attendance</strong>
              <p style={{ margin: '8px 0 0' }}>Rate: {show(data.attendance.rate, '%')}</p>
            </div>
            <div style={{ ...panel, marginBottom: 0, minWidth: 180 }}>
              <strong>Marks</strong>
              <p style={{ margin: '8px 0 0' }}>
                Average: {show(data.assignmentSummary.averagePercent, '%')}<br />
                Graded: {data.assignmentSummary.graded}/{data.assignmentSummary.total}
              </p>
            </div>
            {isParent && data.fees && (
              <div style={{ ...panel, marginBottom: 0, minWidth: 180 }}>
                <strong>Fees</strong>
                <p style={{ margin: '8px 0 0' }}>
                  Paid: {data.fees.summary.paid}<br />
                  Pending: {data.fees.summary.pending}
                </p>
              </div>
            )}
          </div>

          <h2>Upcoming sessions</h2>
          {data.upcoming.length === 0 ? (
            <p>No upcoming sessions.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Subject</th><th>Date and time</th><th>Class link</th></tr>
              </thead>
              <tbody>
                {data.upcoming.map((s) => (
                  <tr key={s._id}>
                    <td>{s.subject}</td>
                    <td>{new Date(s.startTime).toLocaleString()}</td>
                    <td>
                      {safeLink(s.meetLink) ? (
                        <a href={safeLink(s.meetLink)} target="_blank" rel="noreferrer noopener">
                          <button>Join</button>
                        </a>
                      ) : (
                        'Link not added yet'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2>Assignments and marks</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Due</th><th>Status</th><th>Marks</th><th>Feedback</th>
                {!isParent && <th>My file</th>}
              </tr>
            </thead>
            <tbody>
              {data.assignments.length === 0 && (
                <tr><td colSpan={isParent ? 5 : 6}>No assignments yet.</td></tr>
              )}
              {data.assignments.map((a) => (
                <tr key={a._id}>
                  <td>{a.title}</td>
                  <td>
                    {new Date(a.dueDate).toLocaleDateString()}
                    {a.overdue && <span style={{ color: 'tomato' }}> (overdue)</span>}
                  </td>
                  <td>{a.status}</td>
                  <td>{a.status === 'graded' ? `${a.marksObtained}/${a.maxMarks}` : '-'}</td>
                  <td>{a.feedback || '-'}</td>
                  {!isParent && (
                    <td>
                      {a.submission?.fileName && (
                        <>
                          <button onClick={() => viewFile(a)}>{a.submission.originalName}</button>{' '}
                        </>
                      )}
                      {a.status !== 'graded' && (
                        <>
                          <input
                            type="file"
                            onChange={(e) => setFiles({ ...files, [a._id]: e.target.files[0] })}
                          />{' '}
                          <button onClick={() => upload(a)}>Upload</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {isParent && data.fees && (
            <>
              <h2>Fees</h2>
              <table>
                <thead>
                  <tr><th>Month</th><th>Amount</th><th>Paid</th><th>Status</th><th>Due</th></tr>
                </thead>
                <tbody>
                  {data.fees.invoices.map((i) => (
                    <tr key={i._id}>
                      <td>{i.month}</td>
                      <td>{i.amount}</td>
                      <td>{i.paid}</td>
                      <td>{i.status}</td>
                      <td>{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <h2>Recent sessions</h2>
          <table>
            <thead>
              <tr><th>Subject</th><th>Date and time</th><th>Attendance</th></tr>
            </thead>
            <tbody>
              {data.past.length === 0 && <tr><td colSpan="3">No past sessions.</td></tr>}
              {data.past.map((s) => (
                <tr key={s._id}>
                  <td>{s.subject}</td>
                  <td>{new Date(s.startTime).toLocaleString()}</td>
                  <td>{s.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
