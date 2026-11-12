import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar({ user, t, onLang, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false); 
  const navigate = useNavigate();

  function logout() {
    onLogout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <nav className="navbar-resq">
      <div className="container d-flex align-items-center justify-content-between position-relative">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-logo"><i className="bi bi-shield-fill-plus" /></span>
          <span className="brand-name">Res<b>Q</b></span>
        </Link>

        <button className="menu-btn d-lg-none" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={menuOpen ? 'bi bi-x-lg' : 'bi bi-list'} />
        </button>

        <div className={'nav-links ' + (menuOpen ? 'open' : '')} onClick={() => setMenuOpen(false)}>
          {user && (
            <>
              <NavLink to="/app" end>{t('dashboard')}</NavLink>
              <NavLink to="/app/camps">{t('camps')}</NavLink>
              {user.role === 'coordinator' && <NavLink to="/app/analytics">{t('analytics')}</NavLink>}
            </>
          )}

          <button className="lang-btn" onClick={onLang}>{t('langName')}</button>

          {user ? (
            <>
              <span className="avatar mx-auto" title={user.name}>{user.name.charAt(0).toUpperCase()}</span>
              <button className="btn btn-soft btn-sm" onClick={logout}>
                <i className="bi bi-box-arrow-right me-1" />{t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">{t('login')}</Link>
              <Link to="/register" className="btn btn-resq btn-sm text-white">{t('register')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
