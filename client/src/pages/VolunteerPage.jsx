import { useState } from 'react';
import MapView from '../components/MapView';
import RequestCard from '../components/RequestCard';
import StatCard from '../components/StatCard';
import { api } from '../api';
import { useLive } from '../hooks';
import { distanceKm, getMyLocation } from '../helpers';

export default function VolunteerPage({ user, t, toast, onUserChange }) {
  const [requests, setRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [tab, setTab] = useState('open'); 
  const [focus, setFocus] = useState(null);

  function loadData() {
    api.get('/requests').then((d) => setRequests(d.requests)).catch(() => {});
    api.get('/camps').then((d) => setCamps(d.camps)).catch(() => {});
  }
  useLive(loadData);

  const myPosition = { lat: user.lat, lng: user.lng };

  async function toggleAvailable() {
    try {
      const d = await api.patch('/volunteers/me', { available: !user.available });
      onUserChange(d.user);
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  async function saveMyLocation() {
    try {
      const position = await getMyLocation();
      const d = await api.patch('/volunteers/me', position);
      onUserChange(d.user);
      toast(t('locationSaved'));
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  async function accept(request) {
    try {
      await api.post(`/requests/${request.id}/accept`);
      toast(t('taken'));
      setTab('mine');
    } catch (err) {
      toast(err.message, 'danger');
    }
    loadData();
  }

  async function changeStatus(request, status) {
    try {
      await api.patch(`/requests/${request.id}/status`, { status });
      loadData();
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  const openRequests = requests.filter((r) => r.status === 'pending');
  const myTasks = requests.filter((r) => r.assignedTo === user.id && r.status !== 'resolved');
  const doneCount = requests.filter((r) => r.assignedTo === user.id && r.status === 'resolved').length;
  const list = tab === 'open' ? openRequests : myTasks;

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="bi-exclamation-octagon-fill" label={t('nearbyRequests')} value={openRequests.length} color="#e63946" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-clipboard2-pulse-fill" label={t('myTasks')} value={myTasks.length} color="#4f6df5" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-check2-all" label={t('resolved')} value={doneCount} color="#22c55e" /></div>
        <div className="col-6 col-lg-3">
          <div className="card-soft h-100 d-flex flex-column justify-content-center gap-2 fade-up">
            <div className="form-check form-switch m-0">
              <input className="form-check-input" type="checkbox" id="available" checked={user.available} onChange={toggleAvailable} />
              <label className="form-check-label fw-semibold small" htmlFor="available">{t('available')}</label>
            </div>
            <button className="btn btn-soft btn-sm" onClick={saveMyLocation}>
              <i className="bi bi-crosshair me-1" />{t('useMyLocation')}
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="pill-tabs mb-3">
            <button className={tab === 'open' ? 'active' : ''} onClick={() => setTab('open')}>{t('nearbyRequests')} ({openRequests.length})</button>
            <button className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>{t('myTasks')} ({myTasks.length})</button>
          </div>

          <div className="d-grid gap-3 scroll-list">
            {list.length === 0 && (
              <div className="card-soft empty"><i className="bi bi-inbox" />{tab === 'open' ? t('noOpen') : t('noTasks')}</div>
            )}
            {list.map((r) => (
              <RequestCard
                key={r.id}
                t={t}
                r={r}
                showOwner={tab === 'mine'}
                distance={distanceKm(myPosition.lat, myPosition.lng, r.lat, r.lng)}
                onClick={() => setFocus({ lat: r.lat, lng: r.lng })}
              >
                {tab === 'open' ? (
                  <button className="btn btn-resq btn-sm" disabled={!user.available} onClick={() => accept(r)}>
                    <i className="bi bi-hand-thumbs-up-fill me-1" />{t('accept')}
                  </button>
                ) : (
                  <>
                    {r.status === 'assigned' && (
                      <button className="btn btn-soft btn-sm" onClick={() => changeStatus(r, 'in_progress')}>
                        <i className="bi bi-play-fill me-1" />{t('startTask')}
                      </button>
                    )}
                    <button className="btn btn-navy btn-sm" onClick={() => changeStatus(r, 'resolved')}>
                      <i className="bi bi-check2-circle me-1" />{t('markResolved')}
                    </button>
                  </>
                )}
              </RequestCard>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="section-title"><i className="bi bi-map" />{t('liveMap')}</div>
          <MapView t={t} height={560} requests={[...openRequests, ...myTasks]} camps={camps} me={myPosition} focus={focus} />
        </div>
      </div>
    </>
  );
}
