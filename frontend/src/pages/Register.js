import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'patient' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validators = {
    firstName: v => !v?.trim() ? 'First name is required' : v.length > 100 ? 'Too long' : '',
    lastName: v => !v?.trim() ? 'Last name is required' : v.length > 100 ? 'Too long' : '',
    email: v => !v ? 'Email is required' : !/\S+@\S+\.\S+/.test(v) ? 'Invalid email address' : '',
    password: v => !v ? 'Password is required' : v.length < 6 ? 'Minimum 6 characters' : '',
    phone: v => v && !/^[\d\s\-+()]*$/.test(v) ? 'Invalid phone format' : '',
  };

  const validate = (name, value) => validators[name] ? validators[name](value) : '';

  const update = field => e => {
    const val = e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (touched[field]) setFieldErrors(p => ({ ...p, [field]: validate(field, val) }));
  };

  const handleBlur = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    setFieldErrors(p => ({ ...p, [field]: validate(field, form[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = {};
    Object.keys(validators).forEach(k => { errors[k] = validate(k, form[k]); });
    setFieldErrors(errors);
    setTouched({ firstName: true, lastName: true, email: true, password: true, phone: true });
    if (Object.values(errors).some(e => e)) return;

    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'patient' ? '/dashboard' : '/staff');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.details?.[0]?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (field, type = 'text', placeholder = '') => ({
    type,
    className: `form-input${touched[field] && fieldErrors[field] ? ' input-error' : ''}`,
    value: form[field],
    onChange: update(field),
    onBlur: () => handleBlur(field),
    placeholder,
    id: `register-${field}`,
  });

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-mark" style={{ marginBottom: 48 }}>
            <div className="logo-icon">🏥</div>
            <div><div className="logo-text">ClinicAI</div><div className="logo-sub">Patient Care Platform</div></div>
          </div>
          <h1 style={{ color: 'white', fontSize: 38, lineHeight: 1.2, marginBottom: 20 }}>
            Join the future<br /><em style={{ color: '#14b8a6' }}>of care.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7 }}>
            Create your account and start managing your health journey with AI-powered assistance.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form" style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 30, marginBottom: 8 }}>Create account</h2>
          <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 28 }}>Fill in your details to get started</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First name</label>
                <input {...inputProps('firstName', 'text', 'John')} required />
                {touched.firstName && fieldErrors.firstName && <div className="form-error">{fieldErrors.firstName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input {...inputProps('lastName', 'text', 'Doe')} required />
                {touched.lastName && fieldErrors.lastName && <div className="form-error">{fieldErrors.lastName}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input {...inputProps('email', 'email', 'you@example.com')} required />
              {touched.email && fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input {...inputProps('password', 'password', 'Min. 6 characters')} required minLength={6} />
              {touched.password && fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input {...inputProps('phone', 'tel', '555-0100')} />
              {touched.phone && fieldErrors.phone && <div className="form-error">{fieldErrors.phone}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Account type</label>
              <select className="form-input" value={form.role} onChange={update('role')} id="register-role">
                <option value="patient">Patient</option>
                <option value="staff">Staff / Provider</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }} disabled={loading} id="register-submit">
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Creating account...</> : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--slate)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
