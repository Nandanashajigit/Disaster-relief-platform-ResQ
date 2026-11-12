import { useState } from 'react';
import MapView from '../components/MapView';
import RequestCard from '../components/RequestCard';
import StatCard from '../components/StatCard';
import { api } from '../api';
import { useLive } from '../hooks';
import { TYPES, distanceKm, formatKm, timeAgo } from '../helpers';

const STATUSES = ['all', 'pending', 'assigned', 'in_progress', 'resolved'];

export default function CoordinatorPage({ t, toast }) {
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [camps, setCamps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [focus, setFocus] = useState(null);

  function loadData() {
    api.get('/requests').then((d) => setRequests(d.requests)).catch(() => {});
    api.get('/volunteers').then((d) => setVolunteers(d.volunteers)).catch(() => {});
    api.get('/camps').then((d) => setCamps(d.camps)).catch(() => {});
  }
  useLive(loadData);

  async function autoAssign(request) {
    try {
      const d = await api.post(`/requests/${request.id}/auto-assign`);
      toast(`${d.volunteerName} (${d.distanceKm} km)`);
      loadData();
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  async function assign(request, volunteerId) {
    try {
      await api.post(`/requests/${request.id}/assign`, { volunteerId });
      loadData();
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  async function resolve(request) {
    try {
      await api.patch(`/requests/${request.id}/status`, { status: 'resolved' });
      loadData();
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  function volunteerChoices(request) {
    return volunteers
      .filter((v) => v.available)
      .map((v) => ({ volunteer: v, km: distanceKm(request.lat, request.lng, v.lat, v.lng) }))
      .sort((a, b) => a.km - b.km);
  }

  const count = (status) => requests.filter((r) => r.status === status).length;
  const availableVolunteers = volunteers.filter((v) => v.available);

  const queue = requests
    .filter((r) => (statusFilter === 'all' || r.status === statusFilter) && (typeFilter === 'all' || r.type === typeFilter))
    .sort((a, b) => (a.status === 'resolved') - (b.status === 'resolved') || b.priority - a.priority);

  const activity = [];
  requests.forEach((r) => {
    activity.push({ time: r.createdAt, who: r.userName, action: 'act_created', id: r.id });
    if (r.assignedAt) activity.push({ time: r.assignedAt, who: r.assignedName, action: 'act_assigned', id: r.id });
    if (r.resolvedAt) activity.push({ time: r.resolvedAt, who: r.assignedName || r.userName, action: 'act_resolved', id: r.id });
  });
  activity.sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="bi-exclamation-octagon-fill" label={t('openSos')} value={count('pending')} color="#e63946" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-person-check-fill" label={t('activeNow')} value={count('assigned') + count('in_progress')} color="#4f6df5" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-check2-all" label={t('resolvedCount')} value={count('resolved')} color="#22c55e" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-people-fill" label={t('volunteersAvail')} value={availableVolunteers.length} color="#14b8a6" /></div>
      </div>

      <div className="row g-4">
        {}
        <div className="col-xl-5">
          <div className="section-title"><i className="bi bi-sort-numeric-down-alt" />{t('priorityQueue')}</div>

          <div className="d-flex flex-wrap gap-2 mb-2">
            {STATUSES.map((s) => (
              <span key={s} className={'chip ' + (statusFilter === s ? 'on' : '')} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? t('all') : t(s)}
              </span>
            ))}
          </div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {['all', ...TYPES].map((k) => (
              <span key={k} className={'chip ' + (typeFilter === k ? 'on' : '')} onClick={() => setTypeFilter(k)}>
                {k === 'all' ? t('all') : t(k)}
              </span>
            ))}
          </div>

          <div className="d-grid gap-3 scroll-list">
            {queue.length === 0 && <div className="card-soft empty"><i className="bi bi-inbox" />{t('noRequests')}</div>}
            {queue.map((r) => (
              <RequestCard key={r.id} t={t} r={r} showOwner onClick={() => setFocus({ lat: r.lat, lng: r.lng })}>
                {r.status === 'pending' && (
                  <button className="btn btn-resq btn-sm" onClick={() => autoAssign(r)}>
                    <i className="bi bi-magic me-1" />{t('autoAssign')}
                  </button>
                )}
                {r.status !== 'resolved' && (
                  <>
                    <select className="form-select form-select-sm w-auto" value="" onChange={(e) => e.target.value && assign(r, e.target.value)}>
                      <option value="">{t('assignTo')}</option>
                      {volunteerChoices(r).map((c) => (
                        <option key={c.volunteer.id} value={c.volunteer.id}>{c.volunteer.name} - {formatKm(c.km)}</option>
                      ))}
                    </select>
                    <button className="btn btn-soft btn-sm" onClick={() => resolve(r)}>
                      <i className="bi bi-check2-circle me-1" />{t('markResolved')}
                    </button>
                  </>
                )}
              </RequestCard>
            ))}
          </div>
        </div>

        {}
        <div className="col-xl-7">
          <div className="section-title"><i className="bi bi-broadcast-pin" />{t('liveMap')}</div>
          <MapView t={t} height={480} requests={requests} volunteers={availableVolunteers} camps={camps} focus={focus} />

          <div className="card-soft mt-4">
            <div className="section-title"><i className="bi bi-activity" />{t('liveActivity')}</div>
            {activity.slice(0, 8).map((a, i) => (
              <div key={i} className="d-flex justify-content-between gap-3 py-2" style={{ borderTop: i ? '1px solid var(--line)' : 'none', fontSize: '0.9rem' }}>
                <span><strong>{a.who}</strong> {t(a.action)} <span className="muted">#{a.id}</span></span>
                <span className="muted small text-nowrap">{timeAgo(a.time, t)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
