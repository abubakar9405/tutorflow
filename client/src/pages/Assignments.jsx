import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { student: '', title: '', subject: '', dueDate: '', maxMarks: 100 };

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marksObtained: '', feedback: '' });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [a, s] = await Promise.all([api.get('/assignments'), api.get('/students')]);
      setAssignments(a.data);
      setStudents(s.data);
    } catch (err) {
      setError('Could not load assignments');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/assignments', { ...form, maxMarks: Number(form.maxMarks) || 100 });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save assignment');
    }
  };

  const markSubmitted = async (id) => {
    try {
      await api.patch(`/assignments/${id}/submit`);
      load();
    } catch (err) {
      setError('Could not update assignment');
    }
  };

  const startGrade = (a) => {
    setError('');
    setGradingId(a._id);
    setGradeForm({ marksObtained: a.marksObtained ?? '', feedback: a.feedback || '' });
  };

  const saveGrade = async (a) => {
    setError('');
    if (gradeForm.marksObtained === '') {
      setError('Enter the marks first');
      return;
    }
    try {
      await api.patch(`/assignments/${a._id}/grade`, {
        marksObtained: Number(gradeForm.marksObtained),
        feedback: gradeForm.feedback,
      });
      setGradingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not grade assignment');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      load();
    } catch (err) {
      setError('Could not delete assignment');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Assignments</h2>
      {error && <p style={{ color: 'tomato' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <select name="student" value={form.student} onChange={handleChange} required>
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} />
        <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required />
        <input name="maxMarks" type="number" min="1" placeholder="Max marks" value={form.maxMarks} onChange={handleChange} style={{ width: 100 }} />
        <button type="submit">Add assignment</button>
      </form>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Student</th><th>Title</th><th>Subject</th><th>Due</th><th>Status</th><th>Marks</th><th>Feedback</th><th></th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 && (
            <tr><td colSpan="8">No assignments yet.</td></tr>
          )}
          {assignments.map((a) => (
            <tr key={a._id}>
              <td>{a.student?.name}</td>
              <td>{a.title}</td>
              <td>{a.subject}</td>
              <td>
                {new Date(a.dueDate).toLocaleDateString()}
                {a.overdue && <span style={{ color: 'tomato' }}> (overdue)</span>}
              </td>
              <td>{a.status}</td>
              <td>
                {gradingId === a._id ? (
                  <input
                    type="number"
                    min="0"
                    max={a.maxMarks}
                    placeholder={`out of ${a.maxMarks}`}
                    style={{ width: 90 }}
                    value={gradeForm.marksObtained}
                    onChange={(e) => setGradeForm({ ...gradeForm, marksObtained: e.target.value })}
                  />
                ) : a.status === 'graded' ? (
                  `${a.marksObtained}/${a.maxMarks}`
                ) : (
                  '-'
                )}
              </td>
              <td>
                {gradingId === a._id ? (
                  <input
                    placeholder="Feedback (optional)"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  />
                ) : (
                  a.feedback || '-'
                )}
              </td>
              <td>
                {gradingId === a._id ? (
                  <>
                    <button onClick={() => saveGrade(a)}>Save</button>{' '}
                    <button onClick={() => setGradingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {a.status === 'assigned' && <button onClick={() => markSubmitted(a._id)}>Mark submitted</button>}{' '}
                    <button onClick={() => startGrade(a)}>{a.status === 'graded' ? 'Regrade' : 'Grade'}</button>{' '}
                    <button onClick={() => remove(a._id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
