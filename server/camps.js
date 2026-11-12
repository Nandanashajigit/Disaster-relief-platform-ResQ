const express = require('express');
const db = require('./db');
const { requireLogin, onlyRole } = require('./auth');
const { fail, wrap, stockStatus } = require('./helpers');

const router = express.Router();
const notify = (req) => req.app.get('io').emit('update');

router.get('/camps', requireLogin, wrap(async (req, res) => {
  const [camps, items] = await Promise.all([db.list('camps'), db.list('inventory')]);
  const result = camps.map((camp) => ({
    ...camp,
    items: items
      .filter((i) => i.campId === camp.id)
      .map((i) => ({ ...i, ...stockStatus(i, camp) })),
  }));
  res.json({ camps: result });
}));

router.post('/camps', requireLogin, onlyRole('coordinator'), wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const capacity = Number(req.body.capacity);
  if (name.length < 3) fail(400, 'Please enter a camp name');
  if (!(capacity >= 1)) fail(400, 'Capacity must be at least 1');
  const camp = await db.add('camps', { name, capacity, occupancy: 0, lat: Number(req.body.lat), lng: Number(req.body.lng) });
  notify(req);
  res.status(201).json({ camp });
}));

router.patch('/camps/:id', requireLogin, onlyRole('coordinator'), wrap(async (req, res) => {
  const occupancy = Number(req.body.occupancy);
  if (!(occupancy >= 0)) fail(400, 'Occupancy must be 0 or more');
  const camp = await db.update('camps', Number(req.params.id), { occupancy });
  notify(req);
  res.json({ camp });
}));

router.post('/inventory', requireLogin, onlyRole('coordinator'), wrap(async (req, res) => {
  const item = String(req.body.item || '').trim();
  if (item.length < 2) fail(400, 'Please enter an item name');
  const saved = await db.add('inventory', {
    campId: Number(req.body.campId),
    item,
    unit: String(req.body.unit || 'units').trim(),
    quantity: Number(req.body.quantity) || 0,
    usePerPersonPerHour: Number(req.body.usePerPersonPerHour) || 0,
  });
  notify(req);
  res.status(201).json({ item: saved });
}));

router.patch('/inventory/:id', requireLogin, onlyRole('coordinator'), wrap(async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!(quantity >= 0)) fail(400, 'Quantity must be 0 or more');
  const saved = await db.update('inventory', Number(req.params.id), { quantity });
  notify(req);
  res.json({ item: saved });
}));

module.exports = router;
