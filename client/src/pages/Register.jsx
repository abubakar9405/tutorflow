import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} required minLength={6} />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
          <option value="tutor">Tutor</option>
        </select>
        <button type="submit">Create account</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}