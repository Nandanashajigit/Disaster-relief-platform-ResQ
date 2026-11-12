const express = require('express');
const db = require('./db');
const { requireLogin, onlyRole, withoutPassword } = require('./auth');
const { fail, wrap } = require('./helpers');

const router = express.Router();
router.use(requireLogin);

router.get('/', onlyRole('coordinator'), wrap(async (req, res) => {
  const volunteers = await db.list('users', 'role=volunteer');
  res.json({ volunteers: volunteers.map(withoutPassword) });
}));

router.patch('/me', onlyRole('volunteer'), wrap(async (req, res) => {
  const changes = {};
  if (typeof req.body.available === 'boolean') changes.available = req.body.available;
  if (Number.isFinite(Number(req.body.lat)) && Number.isFinite(Number(req.body.lng))) {
    changes.lat = Number(req.body.lat);
    changes.lng = Number(req.body.lng);
  }
  if (Object.keys(changes).length === 0) fail(400, 'Nothing to update');

  const updated = await db.update('users', req.user.id, changes);
  req.app.get('io').emit('update');
  res.json({ user: withoutPassword(updated) });
}));

module.exports = router;
