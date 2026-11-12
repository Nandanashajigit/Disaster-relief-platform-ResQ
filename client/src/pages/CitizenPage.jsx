import { useState } from 'react';
import MapView from '../components/MapView';
import RequestCard from '../components/RequestCard';
import RequestForm from '../components/RequestForm';
import { api } from '../api';
import { useLive } from '../hooks';
import { distanceKm, formatKm, getMyLocation } from '../helpers';

export default function CitizenPage({ user, t, toast }) {
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [myPosition, setMyPosition] = useState(null);
  const [focus, setFocus] = useState(null);

  function loadData() {
    api.get('/requests').then((d) => setRequests(d.requests)).catch(() => {});
    api.get('/camps').then((d) => setCamps(d.camps)).catch(() => {});
  }
  useLive(loadData);

  async function markResolved(request) {
    try {
      await api.patch(`/requests/${request.id}/status`, { status: 'resolved' });
      loadData();
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  async function findMe() {
    try {
      setMyPosition(await getMyLocation());
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  let nearestCamps = [];
  if (myPosition) {
    nearestCamps = camps
      .map((c) => ({ ...c, km: distanceKm(myPosition.lat, myPosition.lng, c.lat, c.lng) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3);
  }

  const myRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <div className="card-soft mb-4 fade-up">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
          <div>
            <p className="muted mb-1">{user.name}</p>
            <h2 className="fw-bold mb-2">{t('needHelp')}</h2>
            <p className="muted mb-0">{t('sosHint')}</p>
          </div>
          {!showForm && <button className="sos-button" onClick={() => setShowForm(true)}>SOS</button>}
        </div>
      </div>

      {showForm && (
        <div className="mb-4">
          <RequestForm user={user} t={t} toast={toast} onCancel={() => setShowForm(false)} onDone={() => { setShowForm(false); loadData(); }} />
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="section-title"><i className="bi bi-list-check" />{t('myRequests')}</div>
          <div className="d-grid gap-3">
            {myRequests.length === 0 && <div className="card-soft empty"><i className="bi bi-inbox" />{t('noRequests')}</div>}
            {myRequests.map((r) => (
              <RequestCard key={r.id} t={t} r={r} onClick={() => setFocus({ lat: r.lat, lng: r.lng })}>
                {(r.status === 'assigned' || r.status === 'in_progress') && (
                  <button className="btn btn-navy btn-sm" onClick={() => markResolved(r)}>
                    <i className="bi bi-check2-circle me-1" />{t('markResolved')}
                  </button>
                )}
              </RequestCard>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="section-title"><i className="bi bi-map" />{t('nearestCamps')}</div>
          <MapView t={t} height={360} requests={requests} camps={camps} me={myPosition} focus={focus} />

          <div className="card-soft mt-3">
            {!myPosition ? (
              <button className="btn btn-soft btn-sm" onClick={findMe}>
                <i className="bi bi-crosshair me-2" />{t('useMyLocation')}
              </button>
            ) : (
              nearestCamps.map((c) => (
                <div key={c.id} className="d-flex justify-content-between py-2" style={{ cursor: 'pointer' }} onClick={() => setFocus({ lat: c.lat, lng: c.lng })}>
                  <span><i className="bi bi-house-door-fill me-2" style={{ color: '#14b8a6' }} />{c.name}</span>
                  <span className="muted small">{formatKm(c.km)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
