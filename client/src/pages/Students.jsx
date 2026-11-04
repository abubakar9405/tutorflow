import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const emptyForm = { name: '', grade: '', parentName: '', monthlyFee: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      setError('Could not load students');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, monthlyFee: Number(form.monthlyFee) || 0 };
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
      } else {
        await api.post('/students', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save student');
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name || '',
      grade: s.grade || '',
      parentName: s.parentName || '',
      monthlyFee: s.monthlyFee ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await api.delete(`/students/${id}`);
    load();
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Students</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        <input name="name" placeholder="Student name" value={form.name} onChange={handleChange} required />
        <input name="grade" placeholder="Grade (e.g. IGCSE)" value={form.grade} onChange={handleChange} />
        <input name="parentName" placeholder="Parent name" value={form.parentName} onChange={handleChange} />
        <input name="monthlyFee" type="number" placeholder="Monthly fee" value={form.monthlyFee} onChange={handleChange} />
        <button type="submit">{editingId ? 'Save changes' : 'Add student'}</button>
        {editingId && <button type="button" onClick={cancelEdit}>Cancel edit</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Parent</th>
            <th>Fee</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td><Link to={`/students/${s._id}`}>{s.name}</Link></td>
              <td>{s.grade}</td>
              <td>{s.parentName}</td>
              <td>{s.monthlyFee}</td>
              <td>
                <button onClick={() => startEdit(s)}>Edit</button>{' '}
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
