import { useState } from 'react';
import MapView from '../components/MapView';
import { api } from '../api';
import { useLive } from '../hooks';
import { CENTER, formatHours } from '../helpers';

function NumberBox({ value, onSave }) {
  const [number, setNumber] = useState(value);
  return (
    <span className="d-inline-flex gap-1">
      <input className="form-control form-control-sm number-box" type="number" min="0" value={number} onChange={(e) => setNumber(e.target.value)} />
      <button className="btn btn-navy btn-sm" disabled={Number(number) === value} onClick={() => onSave(Number(number))}>
        <i className="bi bi-check-lg" />
      </button>
    </span>
  );
}

export default function CampsPage({ user, t, toast }) {
  const isCoordinator = user.role === 'coordinator';
  const [camps, setCamps] = useState([]);
  const [focus, setFocus] = useState(null);

  const [showCampForm, setShowCampForm] = useState(false);
  const [campName, setCampName] = useState('');
  const [campCapacity, setCampCapacity] = useState(100);
  const [campPosition, setCampPosition] = useState(CENTER);

  const [itemCampId, setItemCampId] = useState(null);
  const [item, setItem] = useState({ item: '', quantity: 100, unit: 'kg', usePerPersonPerHour: 0.1 });

  function loadData() {
    api.get('/camps').then((d) => setCamps(d.camps)).catch(() => {});
  }
  useLive(loadData);

  async function run(apiCall) {
    try {
      await apiCall();
      loadData();
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  function addCamp(e) {
    e.preventDefault();
    run(async () => {
      await api.post('/camps', { name: campName, capacity: campCapacity, lat: campPosition.lat, lng: campPosition.lng });
      setShowCampForm(false);
      setCampName('');
      toast(t('save'));
    });
  }

  function addItem(e, campId) {
    e.preventDefault();
    run(async () => {
      await api.post('/inventory', { ...item, campId });
      setItemCampId(null);
      toast(t('save'));
    });
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h2 className="fw-bold m-0"><i className="bi bi-house-heart-fill me-2" style={{ color: '#e63946' }} />{t('reliefCamps')}</h2>
        {isCoordinator && (
          <button className="btn btn-resq" onClick={() => setShowCampForm(!showCampForm)}>
            <i className={'bi me-2 ' + (showCampForm ? 'bi-x-lg' : 'bi-plus-lg')} />{t('addCamp')}
          </button>
        )}
      </div>

      {showCampForm && (
        <form className="card-soft mb-4 fade-up" onSubmit={addCamp}>
          <div className="row g-3">
            <div className="col-lg-5">
              <label className="form-label">{t('campName')}</label>
              <input className="form-control mb-3" value={campName} onChange={(e) => setCampName(e.target.value)} minLength="3" required />
              <label className="form-label">{t('capacity')}</label>
              <input className="form-control mb-3" type="number" min="1" value={campCapacity} onChange={(e) => setCampCapacity(e.target.value)} required />
              <button className="btn btn-resq w-100">{t('add')}</button>
            </div>
            <div className="col-lg-7">
              <label className="form-label">{t('setOnMap')}</label>
              <MapView t={t} height={240} picked={campPosition} onPick={setCampPosition} legend={false} />
            </div>
          </div>
        </form>
      )}

      <div className="mb-4"><MapView t={t} height={300} camps={camps} focus={focus} /></div>

      <div className="row g-4">
        {camps.map((camp) => {
          const percent = Math.min(100, Math.round((camp.occupancy / camp.capacity) * 100));
          return (
            <div className="col-lg-6 col-xl-4" key={camp.id}>
              <div className="card-soft h-100 hover-up">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <h5 className="fw-bold" style={{ cursor: 'pointer' }} onClick={() => setFocus({ lat: camp.lat, lng: camp.lng })}>{camp.name}</h5>
                  <span className="badge-soft st-progress">{percent}%</span>
                </div>

                <div className="d-flex justify-content-between small muted mb-1 mt-2">
                  <span>{t('occupancy')}</span>
                  <span>{camp.occupancy} / {camp.capacity}</span>
                </div>
                <div className="progress"><div className="progress-bar" style={{ width: percent + '%' }} /></div>
                {isCoordinator && (
                  <div className="mt-2">
                    <NumberBox key={camp.occupancy} value={camp.occupancy} onSave={(n) => run(() => api.patch(`/camps/${camp.id}`, { occupancy: n }))} />
                  </div>
                )}

                <div className="section-title mt-4 mb-1" style={{ fontSize: '1rem' }}><i className="bi bi-box-seam" />{t('inventory')}</div>
                {camp.items.map((i) => (
                  <div className="stock-row" key={i.id}>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{i.item}</div>
                      <div className={'small stock-' + i.level}>
                        {i.level !== 'ok' && <i className="bi bi-exclamation-triangle-fill me-1" />}
                        {i.hoursLeft === null
                          ? t('noUse')
                          : i.level === 'ok'
                          ? `${t('stable')} (${formatHours(i.hoursLeft)})`
                          : `${t('runsOut')} ${formatHours(i.hoursLeft)}`}
                      </div>
                    </div>
                    {isCoordinator ? (
                      <NumberBox key={i.quantity} value={i.quantity} onSave={(n) => run(() => api.patch(`/inventory/${i.id}`, { quantity: n }))} />
                    ) : (
                      <span className="muted">{i.quantity} {i.unit}</span>
                    )}
                  </div>
                ))}

                {isCoordinator &&
                  (itemCampId === camp.id ? (
                    <form className="row g-2 mt-2" onSubmit={(e) => addItem(e, camp.id)}>
                      <div className="col-7"><input className="form-control form-control-sm" placeholder={t('item')} value={item.item} onChange={(e) => setItem({ ...item, item: e.target.value })} required /></div>
                      <div className="col-5"><input className="form-control form-control-sm" placeholder={t('unit')} value={item.unit} onChange={(e) => setItem({ ...item, unit: e.target.value })} /></div>
                      <div className="col-6"><input className="form-control form-control-sm" type="number" min="0" placeholder={t('quantity')} value={item.quantity} onChange={(e) => setItem({ ...item, quantity: e.target.value })} /></div>
                      <div className="col-6"><input className="form-control form-control-sm" type="number" min="0" step="0.01" placeholder={t('perPerson')} title={t('perPerson')} value={item.usePerPersonPerHour} onChange={(e) => setItem({ ...item, usePerPersonPerHour: e.target.value })} /></div>
                      <div className="col-12 d-flex gap-2">
                        <button className="btn btn-resq btn-sm flex-grow-1">{t('add')}</button>
                        <button type="button" className="btn btn-soft btn-sm" onClick={() => setItemCampId(null)}>{t('cancel')}</button>
                      </div>
                    </form>
                  ) : (
                    <button className="btn btn-soft btn-sm mt-3" onClick={() => setItemCampId(camp.id)}>
                      <i className="bi bi-plus-lg me-1" />{t('addItem')}
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
