const express = require('express');
const db = require('./db');
const { requireLogin, onlyRole } = require('./auth');
const { fail, wrap, distanceKm, calcPriority, SKILLS_FOR } = require('./helpers');

const router = express.Router();
router.use(requireLogin); 
const TYPES = ['food', 'medicine', 'rescue', 'shelter'];

const notify = (req) => req.app.get('io').emit('update');

function prepare(request, user) {
  const result = { ...request, ...calcPriority(request) };
  const canSeePhone =
    user.role === 'coordinator' || request.userId === user.id || request.assignedTo === user.id;
  if (!canSeePhone) delete result.phone;
  return result;
}

router.post('/', wrap(async (req, res) => {
  const b = req.body;
  if (!TYPES.includes(b.type)) fail(400, 'Please choose what you need');

  const urgency = Number(b.urgency);
  const peopleCount = Number(b.peopleCount);
  const lat = Number(b.lat);
  const lng = Number(b.lng);
  if (!(urgency >= 1 && urgency <= 5)) fail(400, 'Urgency must be between 1 and 5');
  if (!(peopleCount >= 1)) fail(400, 'At least 1 person must be affected');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) fail(400, 'Please choose a location on the map');

  const phone = String(b.phone || req.user.phone || '').trim();
  if (!phone) fail(400, 'A phone number is required');

  const saved = await db.add('requests', {
    userId: req.user.id,
    userName: req.user.name,
    phone,
    type: b.type,
    urgency,
    peopleCount,
    elderly: !!b.elderly,
    children: !!b.children,
    patients: !!b.patients,
    description: String(b.description || '').trim().slice(0, 300),
    lat,
    lng,
    status: 'pending',
    assignedTo: null,
    assignedName: null,
  });

  notify(req);
  res.status(201).json({ request: prepare(saved, req.user) });
}));

router.get('/', wrap(async (req, res) => {
  let list = await db.list('requests');
  const user = req.user;

  if (user.role === 'volunteer') {
    list = list.filter((r) => r.status === 'pending' || r.assignedTo === user.id);
  } else if (user.role === 'citizen') {
    list = list.filter((r) => r.userId === user.id);
  }

  const result = list.map((r) => prepare(r, user)).sort((a, b) => b.priority - a.priority);
  res.json({ requests: result });
}));

async function giveTo(req, requestId, volunteer) {
  const r = await db.get('requests', requestId);
  if (!r) fail(404, 'Request not found');
  if (r.status === 'resolved') fail(400, 'This request is already resolved');
  if (req.user.role === 'volunteer' && r.status !== 'pending') {
    fail(409, 'Another volunteer already took this request');
  }
  const updated = await db.update('requests', requestId, {
    status: 'assigned',
    assignedTo: volunteer.id,
    assignedName: volunteer.name,
    assignedAt: new Date().toISOString(),
  });
  notify(req);
  return updated;
}

router.post('/:id/accept', onlyRole('volunteer'), wrap(async (req, res) => {
  const updated = await giveTo(req, Number(req.params.id), req.user);
  res.json({ request: prepare(updated, req.user) });
}));

router.post('/:id/assign', onlyRole('coordinator'), wrap(async (req, res) => {
  const volunteer = await db.get('users', Number(req.body.volunteerId));
  if (!volunteer || volunteer.role !== 'volunteer') fail(400, 'Volunteer not found');
  const updated = await giveTo(req, Number(req.params.id), volunteer);
  res.json({ request: prepare(updated, req.user) });
}));

router.post('/:id/auto-assign', onlyRole('coordinator'), wrap(async (req, res) => {
  const id = Number(req.params.id);
  const r = await db.get('requests', id);
  if (!r) fail(404, 'Request not found');

  const volunteers = (await db.list('users', 'role=volunteer')).filter((v) => v.available);
  if (volunteers.length === 0) fail(404, 'No volunteers are available right now');

  const useful = SKILLS_FOR[r.type];
  const scored = volunteers.map((v) => {
    const km = distanceKm(r.lat, r.lng, v.lat, v.lng);
    const skillMatch = (v.skills || []).some((s) => useful.includes(s));
    return { volunteer: v, km, score: km - (skillMatch ? 3 : 0) };
  });
  scored.sort((a, b) => a.score - b.score);
  const best = scored[0];

  const updated = await giveTo(req, id, best.volunteer);
  res.json({
    request: prepare(updated, req.user),
    volunteerName: best.volunteer.name,
    distanceKm: Math.round(best.km * 10) / 10,
  });
}));

router.patch('/:id/status', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body.status;
  if (!['in_progress', 'resolved'].includes(status)) fail(400, 'Invalid status');

  const r = await db.get('requests', id);
  if (!r) fail(404, 'Request not found');
  if (r.status === 'resolved') fail(400, 'Already resolved');

  const u = req.user;
  const allowed = u.role === 'coordinator' || r.assignedTo === u.id || (r.userId === u.id && status === 'resolved');
  if (!allowed) fail(403, 'You cannot change this request');
  if (status === 'in_progress' && !r.assignedTo) fail(400, 'Assign a volunteer first');

  const changes = { status };
  if (status === 'resolved') changes.resolvedAt = new Date().toISOString();
  const updated = await db.update('requests', id, changes);

  notify(req);
  res.json({ request: prepare(updated, u) });
}));

module.exports = router;
