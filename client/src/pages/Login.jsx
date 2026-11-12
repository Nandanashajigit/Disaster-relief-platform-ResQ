import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api';

const DEMOS = [
  ['Coordinator', 'coordinator@resq.in'],
  ['Volunteer', 'volunteer1@resq.in'],
  ['Citizen', 'citizen1@resq.in'],
];

export default function Login({ user, t, toast, onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      onLogin(data);
      navigate('/app');
    } catch (err) {
      toast(err.message, 'danger');
    }
    setBusy(false);
  }

  return (
    <div className="auth-page">
      <form className="card-soft auth-card fade-up" onSubmit={submit}>
        <h2 className="fw-bold mb-1">{t('welcomeBack')}</h2>
        <p className="muted mb-4">{t('signInSub')}</p>

        <div className="mb-3">
          <label className="form-label">{t('email')}</label>
          <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('password')}</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button className="btn btn-resq w-100 py-2 mt-2" disabled={busy}>
          {busy ? t('pleaseWait') : t('login')}
        </button>

        <p className="text-center muted mt-4 mb-0 small">
          {t('noAccount')} <Link to="/register" className="fw-semibold" style={{ color: '#e63946' }}>{t('register')}</Link>
        </p>

        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
         
          <div className="d-flex flex-wrap gap-2">
            {DEMOS.map(([label, demoEmail]) => (
              <button type="button" key={label} className="demo-btn" onClick={() => { setEmail(demoEmail); setPassword('resq123'); }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
