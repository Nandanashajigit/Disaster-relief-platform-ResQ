const express = require('express');
const db = require('./db');
const { requireLogin, onlyRole } = require('./auth');
const { wrap } = require('./helpers');

const router = express.Router();

function averageMinutes(list, from, to) {
  const times = list
    .filter((r) => r[from] && r[to])
    .map((r) => (new Date(r[to]) - new Date(r[from])) / 60000);
  if (times.length === 0) return null;
  return Math.round(times.reduce((sum, m) => sum + m, 0) / times.length);
}

router.get('/stats', requireLogin, onlyRole('coordinator'), wrap(async (req, res) => {
  const requests = await db.list('requests');
  const count = (field, value) => requests.filter((r) => r[field] === value).length;

  const perHour = [];
  for (let i = 23; i >= 0; i--) {
    const start = Date.now() - (i + 1) * 3600000;
    const end = start + 3600000;
    const label = new Date(end).getHours().toString().padStart(2, '0') + ':00';
    const total = requests.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return t >= start && t < end;
    }).length;
    perHour.push({ label, total });
  }

  res.json({
    total: requests.length,
    peopleHelped: requests.filter((r) => r.status === 'resolved').reduce((sum, r) => sum + r.peopleCount, 0),
    avgResponseMinutes: averageMinutes(requests, 'createdAt', 'assignedAt'),
    avgResolutionMinutes: averageMinutes(requests, 'createdAt', 'resolvedAt'),
    byType: ['food', 'medicine', 'rescue', 'shelter'].map((t) => count('type', t)),
    byStatus: ['pending', 'assigned', 'in_progress', 'resolved'].map((s) => count('status', s)),
    perHour,
  });
}));

module.exports = router;
