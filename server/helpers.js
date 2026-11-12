
function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' });
  });

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function calcPriority(r) {
  const urgency = r.urgency * 8; 

  let vulnerable = 0;
  if (r.elderly) vulnerable += 10;
  if (r.children) vulnerable += 10;
  if (r.patients) vulnerable += 10;

  const people = (Math.min(r.peopleCount, 20) / 20) * 15;

  const hoursWaiting = (Date.now() - new Date(r.createdAt).getTime()) / 3600000;
  const waiting = (Math.min(hoursWaiting, 12) / 12) * 15;

  const priority = Math.round(urgency + vulnerable + people + waiting);
  let level = 'low';
  if (priority >= 65) level = 'critical';
  else if (priority >= 50) level = 'high';
  else if (priority >= 30) level = 'medium';

  return {
    priority,
    level,
    parts: { urgency, vulnerable, people: Math.round(people), waiting: Math.round(waiting) },
  };
}

const SKILLS_FOR = {
  food: ['food', 'logistics', 'general'],
  medicine: ['medical', 'first-aid'],
  rescue: ['rescue', 'swimming', 'first-aid'],
  shelter: ['shelter', 'logistics', 'general'],
};

function stockStatus(item, camp) {
  const perHour = camp.occupancy * item.usePerPersonPerHour;
  if (perHour <= 0) return { hoursLeft: null, level: 'ok' };
  const hoursLeft = Math.round((item.quantity / perHour) * 10) / 10;
  let level = 'ok';
  if (hoursLeft < 6) level = 'critical';
  else if (hoursLeft < 24) level = 'warning';
  return { hoursLeft, level };
}

module.exports = { fail, wrap, distanceKm, calcPriority, SKILLS_FOR, stockStatus };
