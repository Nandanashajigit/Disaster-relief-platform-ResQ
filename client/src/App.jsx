
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenPage from './pages/CitizenPage';
import VolunteerPage from './pages/VolunteerPage';
import CoordinatorPage from './pages/CoordinatorPage';
import CampsPage from './pages/CampsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { translations } from './translations';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('resq_user') || 'null'));
  const [lang, setLang] = useState(localStorage.getItem('resq_lang') || 'en');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem('resq_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  function t(key) {
    return translations[lang][key] || translations.en[key] || key;
  }

  function toggleLang() {
    setLang(lang === 'en' ? 'ml' : 'en');
  }

  function toast(text, type = 'success') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  function login(data) {
    localStorage.setItem('resq_token', data.token);
    localStorage.setItem('resq_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('resq_token');
    localStorage.removeItem('resq_user');
    setUser(null);
  }

  function changeUser(newUser) {
    localStorage.setItem('resq_user', JSON.stringify(newUser));
    setUser(newUser);
  }

  function protect(page, roles) {
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
    return page;
  }

  function dashboard() {
    if (user.role === 'coordinator') return <CoordinatorPage t={t} toast={toast} />;
    if (user.role === 'volunteer') return <VolunteerPage user={user} t={t} toast={toast} onUserChange={changeUser} />;
    return <CitizenPage user={user} t={t} toast={toast} />;
  }

  return (
    <>
      <Navbar user={user} t={t} onLang={toggleLang} onLogout={logout} />

      <Routes>
        <Route path="/" element={<Home user={user} t={t} />} />
        <Route path="/login" element={<Login user={user} t={t} toast={toast} onLogin={login} />} />
        <Route path="/register" element={<Register user={user} t={t} toast={toast} onLogin={login} />} />

        <Route path="/app" element={protect(<main className="page"><div className="container">{user && dashboard()}</div></main>)} />
        <Route path="/app/camps" element={protect(<main className="page"><div className="container"><CampsPage user={user} t={t} toast={toast} /></div></main>)} />
        <Route path="/app/analytics" element={protect(<main className="page"><div className="container"><AnalyticsPage t={t} /></div></main>, ['coordinator'])} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {message && <div className={'toast-box ' + message.type}>{message.text}</div>}
    </>
  );
}
