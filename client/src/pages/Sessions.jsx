import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { student: '', subject: '', startTime: '', repeatWeeks: 0, meetLink: '' };
const safeLink = (u) => (/^https?:\/\//i.test(u || '') ? u : null);

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [s, st] = await Promise.all([api.get('/sessions'), api.get('/students')]);
      setSessions(s.data);
      setStudents(st.data);
    } catch (err) {
      setError('Could not load data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/sessions', {
        student: form.student,
        subject: form.subject,
        startTime: new Date(form.startTime).toISOString(),
        repeatWeeks: Number(form.repeatWeeks) || 0,
        meetLink: form.meetLink,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add session');
    }
  };

  const mark = async (id, attendance) => {
    await api.patch(`/sessions/${id}/attendance`, { attendance });
    load();
  };

  const cancel = async (id) => {
    await api.patch(`/sessions/${id}/cancel`);
    load();
  };

  const reschedule = async (id) => {
    const value = window.prompt('New date and time (format: 2026-11-20 16:30)');
    if (!value) return;
    const date = new Date(value.replace(' ', 'T'));
    if (isNaN(date.getTime())) {
      setError('That date was not valid. Use the format 2026-11-20 16:30');
      return;
    }
    setError('');
    await api.put(`/sessions/${id}`, { startTime: date.toISOString(), status: 'scheduled' });
    load();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Sessions</h1>

      <form onSubmit={handleAdd} style={{ display: 'grid', gap: 8, marginBottom: 24, maxWidth: 400 }}>
        <select name="student" value={form.student} onChange={handleChange} required>
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
        <input
          name="meetLink"
          type="url"
          placeholder="Meet link (https://meet.google.com/...)"
          value={form.meetLink}
          onChange={handleChange}
        />
        <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} required />
        <input
          name="repeatWeeks"
          type="number"
          min="0"
          placeholder="Repeat for extra weeks (0 = one session)"
          value={form.repeatWeeks}
          onChange={handleChange}
        />
        <button type="submit">Add session</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Meet</th>
            <th>Date and time</th>
            <th>Status</th>
            <th>Attendance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s._id}>
              <td>{s.student?.name}</td>
              <td>{s.subject}</td>
              <td>
                {safeLink(s.meetLink) ? (
                  <a href={safeLink(s.meetLink)} target="_blank" rel="noreferrer noopener">Link</a>
                ) : (
                  '-'
                )}
              </td>
              <td>{new Date(s.startTime).toLocaleString()}</td>
              <td>{s.status}</td>
              <td>{s.attendance}</td>
              <td>
                <button onClick={() => mark(s._id, 'present')}>Present</button>{' '}
                <button onClick={() => mark(s._id, 'absent')}>Absent</button>{' '}
                <button onClick={() => reschedule(s._id)}>Reschedule</button>{' '}
                <button onClick={() => cancel(s._id)}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
