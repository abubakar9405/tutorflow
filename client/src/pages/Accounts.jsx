import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { name: '', email: '', password: '', role: 'parent' };

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [resetId, setResetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (err) {
      setError('Could not load accounts');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/accounts', form);
      setMessage(`Account created for ${form.email}. Share the password with them privately.`);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account');
    }
  };

  const savePassword = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/accounts/${id}/password`, { password: newPassword });
      setResetId(null);
      setNewPassword('');
      setMessage('Password updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      load();
    } catch (err) {
      setError('Could not delete account');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Accounts</h1>
      <p className="muted">
        Create logins for parents and students. The email must match the Parent email or Student
        email on the student record.
      </p>
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      {message && <p style={{ color: 'lightgreen' }}>{message}</p>}

      <form onSubmit={create} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="text" placeholder="Password (min 6)" value={form.password} onChange={handleChange} required minLength={6} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="parent">Parent</option>
          <option value="student">Student</option>
        </select>
        <button type="submit">Create account</button>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>
        </thead>
        <tbody>
          {accounts.length === 0 && <tr><td colSpan="4">No accounts yet.</td></tr>}
          {accounts.map((a) => (
            <tr key={a._id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.role}</td>
              <td>
                {resetId === a._id ? (
                  <>
                    <input
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />{' '}
                    <button onClick={() => savePassword(a._id)}>Save</button>{' '}
                    <button onClick={() => setResetId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setResetId(a._id); setNewPassword(''); }}>Reset password</button>{' '}
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
