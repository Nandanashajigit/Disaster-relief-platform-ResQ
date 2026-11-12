import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { SKILLS, getMyLocation } from '../helpers';

export default function Register({ user, t, toast, onLogin }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const startRole = ['citizen', 'volunteer'].includes(params.get('role')) ? params.get('role') : 'citizen';

  const [role, setRole] = useState(startRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [skills, setSkills] = useState([]);
  const [position, setPosition] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  function toggleSkill(skill) {
    if (skills.includes(skill)) setSkills(skills.filter((s) => s !== skill));
    else setSkills([...skills, skill]);
  }

  async function findLocation() {
    try {
      setPosition(await getMyLocation());
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { name, email, phone, password, role, code, skills };
      if (position) { body.lat = position.lat; body.lng = position.lng; }
      const data = await api.post('/auth/register', body);
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
        <h2 className="fw-bold mb-1">{t('createAccount')}</h2>
        <p className="muted mb-4">{t('joinSub')}</p>

        <label className="form-label">{t('iAm')}</label>
        <div className="pick-row mb-3">
          {['citizen', 'volunteer', 'coordinator'].map((r) => (
            <button type="button" key={r} className={role === r ? 'active' : ''} onClick={() => setRole(r)}>{t(r)}</button>
          ))}
        </div>

        <div className="mb-3">
          <label className="form-label">{t('name')}</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('email')}</label>
          <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('phone')}</label>
          <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxx xxxxx" required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('password')}</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('min8')} minLength="6" required />
        </div>

        {role === 'volunteer' && (
          <div className="mb-3">
            <label className="form-label">{t('skills')}</label>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {SKILLS.map((s) => (
                <span key={s} className={'chip ' + (skills.includes(s) ? 'on' : '')} onClick={() => toggleSkill(s)}>{s}</span>
              ))}
            </div>
            <button type="button" className="btn btn-soft btn-sm" onClick={findLocation}>
              <i className={'bi me-2 ' + (position ? 'bi-check-circle-fill text-success' : 'bi-crosshair')} />
              {position ? t('locationSet') : t('useMyLocation')}
            </button>
          </div>
        )}

        {role === 'coordinator' && (
          <div className="mb-3">
            <label className="form-label">{t('inviteCode')}</label>
            <input className="form-control" value={code} onChange={(e) => setCode(e.target.value)} placeholder="RESQ2026" required />
          </div>
        )}

        <button className="btn btn-resq w-100 py-2 mt-2" disabled={busy}>
          {busy ? t('pleaseWait') : t('register')}
        </button>

        <p className="text-center muted mt-4 mb-0 small">
          {t('haveAccount')} <Link to="/login" className="fw-semibold" style={{ color: '#e63946' }}>{t('login')}</Link>
        </p>
      </form>
    </div>
  );
}
