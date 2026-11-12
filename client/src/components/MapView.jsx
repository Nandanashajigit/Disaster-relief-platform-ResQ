import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { CENTER, LEVEL_COLOR } from '../helpers';

function ClickToPick({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 14, { duration: 0.8 });
  }, [position, map]);
  return null;
}

export default function MapView({ t, height = 420, requests = [], volunteers = [], camps = [], me = null, picked = null, onPick, focus = null, legend = true }) {
  const start = picked || me || CENTER;

  return (
    <>
      <div className="map-box" style={{ height }}>
        <MapContainer center={[start.lat, start.lng]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  maxZoom={19}
/>
          {onPick && <ClickToPick onPick={onPick} />}
          <FlyTo position={focus} />

          {}
          {requests
            .filter((r) => r.status !== 'resolved')
            .map((r) => (
              <CircleMarker
                key={'r' + r.id}
                center={[r.lat, r.lng]}
                radius={9 + r.priority / 12}
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: LEVEL_COLOR[r.level], fillOpacity: 0.9 }}
              >
                <Popup>
                  <strong>{t(r.type)}</strong> &middot; {r.peopleCount} <i className="bi bi-people-fill" />
                  <br />
                  {r.description}
                  <br />
                  <small>{t('priority')}: {r.priority} &middot; {t(r.status)}</small>
                </Popup>
              </CircleMarker>
            ))}

          {}
          {volunteers.map((v) => (
            <CircleMarker key={'v' + v.id} center={[v.lat, v.lng]} radius={8} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#4f6df5', fillOpacity: 0.95 }}>
              <Popup><strong>{v.name}</strong><br />{t('volunteer')}</Popup>
            </CircleMarker>
          ))}

          {}
          {camps.map((c) => (
            <CircleMarker key={'c' + c.id} center={[c.lat, c.lng]} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#14b8a6', fillOpacity: 0.95 }}>
              <Popup><strong>{c.name}</strong><br />{t('occupancy')}: {c.occupancy} / {c.capacity}</Popup>
            </CircleMarker>
          ))}

          {}
          {me && <CircleMarker center={[me.lat, me.lng]} radius={8} pathOptions={{ color: '#1b2a49', weight: 4, fillColor: '#ffffff', fillOpacity: 1 }} />}

          {}
          {picked && <CircleMarker center={[picked.lat, picked.lng]} radius={11} pathOptions={{ color: '#e63946', weight: 4, fillColor: '#ffffff', fillOpacity: 1 }} />}
        </MapContainer>
      </div>

      {legend && (
        <div className="map-legend">
          <span><i className="bi bi-circle-fill" style={{ color: LEVEL_COLOR.critical }} />SOS</span>
          {volunteers.length > 0 && <span><i className="bi bi-circle-fill" style={{ color: '#4f6df5' }} />{t('volunteer')}</span>}
          {camps.length > 0 && <span><i className="bi bi-circle-fill" style={{ color: '#14b8a6' }} />{t('camps')}</span>}
        </div>
      )}
    </>
  );
}
