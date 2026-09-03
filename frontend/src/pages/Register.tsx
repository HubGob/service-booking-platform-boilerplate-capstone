import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

interface FormState {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'provider';
}

const Register = (): JSX.Element => {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    role: 'client',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />
        <div className="role-picker">
          <label>
            <input
              type="radio"
              name="role"
              value="client"
              checked={form.role === 'client'}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as 'client' | 'provider',
                })
              }
            />{' '}
            I want to book services (Client)
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="provider"
              checked={form.role === 'provider'}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as 'client' | 'provider',
                })
              }
            />{' '}
            I want to offer services (Provider)
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
