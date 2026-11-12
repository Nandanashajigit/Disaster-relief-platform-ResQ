import { LEVEL_COLOR, STATUS_CLASS, TYPE_INFO, formatKm, timeAgo } from '../helpers';

export default function RequestCard({ t, r, children, distance = null, showOwner = false, onClick }) {
  const type = TYPE_INFO[r.type];

  const p = r.parts;
  const why = p
    ? `${t('priorityWhy')}\n${t('pUrgency')}: ${p.urgency}/40\n${t('pVulnerable')}: ${p.vulnerable}/30\n${t('pPeople')}: ${p.people}/15\n${t('pWaiting')}: ${p.waiting}/15`
    : '';

  return (
    <div className={'request-card ' + (onClick ? 'clickable' : '')} style={{ '--accent': type.color }} onClick={onClick}>
      <div className="d-flex gap-3 align-items-start">
        <div className="type-icon" style={{ background: type.color + '22', color: type.color }}>
          <i className={'bi ' + type.icon} />
        </div>

        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <strong>{t(r.type)}</strong>
            <span className={'badge-soft ' + STATUS_CLASS[r.status]}>{t(r.status)}</span>
            <span className="badge-soft"><i className="bi bi-people-fill" /> {r.peopleCount}</span>
            {r.elderly && <span className="badge-soft">{t('elderly')}</span>}
            {r.children && <span className="badge-soft">{t('children')}</span>}
            {r.patients && <span className="badge-soft">{t('patients')}</span>}
          </div>

          {r.description && <p className="request-text">{r.description}</p>}

          <div className="meta">
            <span><i className="bi bi-clock" /> {timeAgo(r.createdAt, t)}</span>
            {showOwner && <span><i className="bi bi-person" /> {r.userName}</span>}
            {distance !== null && <span><i className="bi bi-signpost-2" /> {formatKm(distance)} {t('away')}</span>}
            {r.assignedName && <span><i className="bi bi-person-check" /> {t('helpOnTheWay')} {r.assignedName}</span>}
            {r.phone && (
              <a href={'tel:' + r.phone.replace(/\s/g, '')} onClick={(e) => e.stopPropagation()}>
                <i className="bi bi-telephone" /> {r.phone}
              </a>
            )}
          </div>

          {children && (
            <div className="d-flex flex-wrap gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          )}
        </div>

        <div className="priority" style={{ background: LEVEL_COLOR[r.level] }} title={why}>
          {r.priority}
        </div>
      </div>
    </div>
  );
}
