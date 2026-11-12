import { Link } from 'react-router-dom';

const FEATURES = [
  ['bi-speedometer2', 'f1'],
  ['bi-diagram-3-fill', 'f2'],
  ['bi-broadcast-pin', 'f3'],
  ['bi-box-seam-fill', 'f4'],
  ['bi-shield-lock-fill', 'f5'],
  ['bi-translate', 'f6'],
];

export default function Home({ user, t }) {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 fade-up">
              <span className="tag"><i className="bi bi-lightning-charge-fill" />{t('tagline')}</span>
              <h1 className="mt-4">
                {t('heroTitle1')} <span className="gradient-text">{t('heroTitle2')}</span>
              </h1>
              <p className="lead mt-4">{t('heroSub')}</p>

              <div className="d-flex flex-wrap gap-3 mt-4">
                {user ? (
                  <Link to="/app" className="btn btn-resq btn-lg px-4">
                    <i className="bi bi-grid-1x2-fill me-2" />{t('ctaDashboard')}
                  </Link>
                ) : (
                  <>
                    <Link to="/register?role=citizen" className="btn btn-resq btn-lg px-4">
                      <i className="bi bi-broadcast me-2" />{t('ctaHelp')}
                    </Link>
                    <Link to="/register?role=volunteer" className="btn btn-soft btn-lg px-4">
                      <i className="bi bi-heart-fill me-2" style={{ color: '#e63946' }} />{t('ctaVolunteer')}
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-5 fade-up">
              <div className="radar">
                <div className="ring" />
                <div className="ring" />
                <div className="ring" />
                <span className="dot red" style={{ top: '14%', left: '58%' }} />
                <span className="dot red" style={{ top: '66%', left: '16%' }} />
                <span className="dot blue" style={{ top: '40%', left: '80%' }} />
                <span className="dot blue" style={{ top: '78%', left: '62%' }} />
                <div className="center"><i className="bi bi-shield-fill-plus" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {FEATURES.map(([icon, key]) => (
              <div className="col-md-6 col-lg-4" key={key}>
                <div className="card-soft hover-up h-100">
                  <div className="feature-icon"><i className={'bi ' + icon} /></div>
                  <h5 className="fw-bold">{t(key + 't')}</h5>
                  <p className="muted mb-0">{t(key + 'd')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">{t('howTitle')}</h2>
          <div className="row g-4">
            {['s1', 's2', 's3'].map((key, i) => (
              <div className="col-md-4" key={key}>
                <div className="card-soft hover-up h-100">
                  <div className="step-number">{i + 1}</div>
                  <h5 className="fw-bold">{t(key + 't')}</h5>
                  <p className="muted mb-0">{t(key + 'd')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container d-flex justify-content-between flex-wrap gap-2">
          <span><strong className="gradient-text">ResQ</strong> &middot; {t('footer')}</span>
          <span>React &middot; Node &middot; Socket.io &middot; json-server</span>
        </div>
      </footer>
    </>
  );
}
