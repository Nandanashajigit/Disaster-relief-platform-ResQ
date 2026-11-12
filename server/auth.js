
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./db');
const { fail, wrap } = require('./helpers');

const SECRET = 'resq-demo-secret';
const COORDINATOR_CODE = 'RESQ2026'; 
const router = express.Router();

function withoutPassword(user) {
  const { password, ...rest } = user;
  return rest;
}

router.post('/register', wrap(async (req, res) => {
  const { name, email, phone, password, role, skills, lat, lng, code } = req.body;

  if (!name || !email || !phone || !password) fail(400, 'Please fill in all the fields');
  if (password.length < 6) fail(400, 'Password must be at least 6 characters');
  if (!['citizen', 'volunteer', 'coordinator'].includes(role)) fail(400, 'Please choose a role');
  if (role === 'coordinator' && code !== COORDINATOR_CODE) fail(403, 'Wrong coordinator code');

  const users = await db.list('users');
  if (users.find((u) => u.email === email.toLowerCase())) fail(409, 'This email is already registered');

  const newUser = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password: bcrypt.hashSync(password, 8), 
    role,
  };
  if (role === 'volunteer') {
    newUser.available = true;
    newUser.skills = skills && skills.length ? skills : ['general'];
    newUser.lat = Number(lat) || 11.6085;
    newUser.lng = Number(lng) || 76.083;
  }

  const saved = await db.add('users', newUser);
  const token = jwt.sign({ id: saved.id }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: withoutPassword(saved) });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const users = await db.list('users');
  const user = users.find((u) => u.email === String(email).trim().toLowerCase());

  if (!user || !bcrypt.compareSync(String(password), user.password)) fail(401, 'Wrong email or password');

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: withoutPassword(user) });
}));

const requireLogin = wrap(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch {
    fail(401, 'Please log in again');
  }
  const user = await db.get('users', payload.id);
  if (!user) fail(401, 'Account not found');
  req.user = withoutPassword(user);
  next();
});

const onlyRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'You are not allowed to do this' });
  next();
};

module.exports = { router, requireLogin, onlyRole, withoutPassword };
