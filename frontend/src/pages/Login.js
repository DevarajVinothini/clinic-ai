import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default: return '';
    }
  };

  const handleBlur = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    if (Object.values(errors).some(e => e)) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'patient' ? '/dashboard' : '/staff');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.details?.[0]?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-mark" style={{ marginBottom: 48 }}>
            <div className="logo-icon">🏥</div>
            <div>
              <div className="logo-text">ClinicAI</div>
              <div className="logo-sub">Patient Care Platform</div>
            </div>
          </div>
          <h1 style={{ color: 'white', fontSize: 38, lineHeight: 1.2, marginBottom: 20 }}>
            Smarter care,<br /><em style={{ color: '#14b8a6' }}>always on time.</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7, maxWidth: 380 }}>
            AI-powered appointment management that reduces no-shows, keeps patients on track with medications, and gives your clinic staff the insights they need.
          </p>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '🤖', text: 'AI health chatbot for patients' },
              { icon: '📊', text: 'No-show risk prediction dashboard' },
              { icon: '💊', text: 'Medication adherence tracking' },
              { icon: '🔔', text: 'Automated appointment reminders' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          <h2 style={{ fontSize: 30, marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 32 }}>
            Sign in to your account to continue
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className={`form-input${touched.email && fieldErrors.email ? ' input-error' : ''}`}
                value={email}
                onChange={e => { setEmail(e.target.value); if (touched.email) setFieldErrors(p => ({ ...p, email: validateField('email', e.target.value) })); }}
                onBlur={() => handleBlur('email', email)}
                placeholder="you@example.com"
                required
                autoFocus
                id="login-email"
              />
              {touched.email && fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-input${touched.password && fieldErrors.password ? ' input-error' : ''}`}
                value={password}
                onChange={e => { setPassword(e.target.value); if (touched.password) setFieldErrors(p => ({ ...p, password: validateField('password', e.target.value) })); }}
                onBlur={() => handleBlur('password', password)}
                placeholder="••••••••"
                required
                id="login-password"
              />
              {touched.password && fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }} disabled={loading} id="login-submit">
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--slate)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 500 }}>Register</Link>
          </p>

          <div style={{ marginTop: 40, padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo accounts</p>
            <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.8 }}>
              <strong>Staff:</strong> staff@clinic.com / staff123<br />
              <strong>Patient:</strong> john.doe@email.com / patient123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
