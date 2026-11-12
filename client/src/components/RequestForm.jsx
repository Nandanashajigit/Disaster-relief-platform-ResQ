import { useState } from 'react';
import MapView from './MapView';
import { api } from '../api';
import { CENTER, TYPES, TYPE_INFO, getMyLocation } from '../helpers';

export default function RequestForm({ user, t, toast, onDone, onCancel }) {
  const [type, setType] = useState('food');
  const [urgency, setUrgency] = useState(3);
  const [peopleCount, setPeopleCount] = useState(1);
  const [elderly, setElderly] = useState(false);
  const [children, setChildren] = useState(false);
  const [patients, setPatients] = useState(false);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [position, setPosition] = useState(CENTER);
  const [flyTo, setFlyTo] = useState(null);
  const [busy, setBusy] = useState(false);

  async function useMyLocation() {
    try {
      const p = await getMyLocation();
      setPosition(p);
      setFlyTo({ ...p }); 
    } catch (err) {
      toast(err.message, 'danger');
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/requests', {
        type, urgency, peopleCount, elderly, children, patients, description, phone,
        lat: position.lat, lng: position.lng,
      });
      toast(t('sosSent'));
      onDone();
    } catch (err) {
      toast(err.message, 'danger');
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card-soft fade-up">
      <div className="row g-4">
        <div className="col-lg-6">
          <label className="form-label">{t('whatNeed')}</label>
          <div className="row g-2 mb-3">
            {TYPES.map((k) => (
              <div className="col-3" key={k}>
                <button type="button" className={'type-tile ' + (type === k ? 'active' : '')} onClick={() => setType(k)}>
                  <i className={'bi ' + TYPE_INFO[k].icon} style={{ color: TYPE_INFO[k].color }} />
                  {t(k)}
                </button>
              </div>
            ))}
          </div>

          <label className="form-label">{t('urgency')}</label>
          <div className="pick-row mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} className={urgency === n ? 'active' : ''} onClick={() => setUrgency(n)}>
                {t('u' + n)}
              </button>
            ))}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label">{t('peopleCount')}</label>
              <input className="form-control" type="number" min="1" max="500" value={peopleCount} onChange={(e) => setPeopleCount(e.target.value)} required />
            </div>
            <div className="col-6">
              <label className="form-label">{t('phone')}</label>
              <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </div>

          <label className="form-label">{t('vulnerable')}</label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className={'chip ' + (elderly ? 'on' : '')} onClick={() => setElderly(!elderly)}>{t('elderly')}</span>
            <span className={'chip ' + (children ? 'on' : '')} onClick={() => setChildren(!children)}>{t('children')}</span>
            <span className={'chip ' + (patients ? 'on' : '')} onClick={() => setPatients(!patients)}>{t('patients')}</span>
          </div>

          <label className="form-label">{t('description')}</label>
          <textarea className="form-control" rows="3" maxLength="300" placeholder={t('descPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="col-lg-6 d-flex flex-column">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
            <label className="form-label m-0">{t('pickLocation')}</label>
            <button type="button" className="btn btn-soft btn-sm" onClick={useMyLocation}>
              <i className="bi bi-crosshair me-1" />{t('useMyLocation')}
            </button>
          </div>
          <MapView t={t} height={300} picked={position} onPick={setPosition} focus={flyTo} legend={false} />

          <div className="d-flex gap-2 justify-content-end mt-auto pt-4">
            <button type="button" className="btn btn-soft" onClick={onCancel}>{t('cancel')}</button>
            <button className="btn btn-resq px-4" disabled={busy}>
              <i className="bi bi-broadcast me-2" />{busy ? t('pleaseWait') : t('sendRequest')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
