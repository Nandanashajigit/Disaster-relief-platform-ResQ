
export const CENTER = { lat: 11.6085, lng: 76.083 };

export const TYPES = ['food', 'medicine', 'rescue', 'shelter'];

export const TYPE_INFO = {
  food: { icon: 'bi-basket2-fill', color: '#f59e0b' },
  medicine: { icon: 'bi-capsule', color: '#10b981' },
  rescue: { icon: 'bi-life-preserver', color: '#ef4444' },
  shelter: { icon: 'bi-house-heart-fill', color: '#6366f1' },
};

export const STATUS_CLASS = {
  pending: 'st-pending',
  assigned: 'st-assigned',
  in_progress: 'st-progress',
  resolved: 'st-resolved',
};

export const LEVEL_COLOR = {
  critical: '#e63946',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export const SKILLS = ['medical', 'first-aid', 'rescue', 'swimming', 'food', 'logistics', 'shelter', 'general'];

export function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export function formatKm(km) {
  return km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km';
}

export function timeAgo(iso, t) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return minutes + 'm ' + t('ago');
  if (minutes < 1440) return Math.floor(minutes / 60) + 'h ' + t('ago');
  return Math.floor(minutes / 1440) + 'd ' + t('ago');
}

export function formatHours(h) {
  if (h === null || h === undefined) return '-';
  if (h < 1) return Math.round(h * 60) + ' min';
  if (h < 48) return h.toFixed(1) + ' h';
  return Math.round(h / 24) + ' d';
}

export function getMyLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not supported on this device'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(new Error(e.message || 'Could not get your location'))
    );
  });
}
