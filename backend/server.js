require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { validateTicket } = require('./src/services/cas');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const SERVICE_BASE = process.env.SERVICE_URL || 'http://localhost:4000';
// Simple in-memory session replacement for demo (use real sessions in production)
const sessions = {};
app.get('/auth/login', (req, res) => {
  const service = `${SERVICE_BASE}/auth/callback`;
  const redirect = `https://passport.ustc.edu.cn/login?service=${encodeURIComponent(service)}`;
  res.redirect(redirect);
});
app.get('/auth/callback', async (req, res) => {
  const { ticket } = req.query;
  if (!ticket) return res.status(400).send('missing ticket');
  try {
    const info = await validateTicket(ticket, `${SERVICE_BASE}/auth/callback`);
    // This demo expects a parsed structure; we'll try to extract username
    const success = info && info['cas:serviceResponse'] && info['cas:serviceResponse']['cas:authenticationSuccess'];
    if (!success) return res.status(401).send('CAS validation failed');
    const auth = success[0];
    const username = (auth['cas:user'] && auth['cas:user'][0]) || 'unknown';
    // create/find user by username
    let user = await prisma.user.findUnique({ where: { gid: username } });
    if (!user) {
      user = await prisma.user.create({ data: { gid: username, studentId: 'AB00000001', name: username }});
    }
    // create a simple session token
    const token = 'sess-' + Math.random().toString(36).slice(2,12);
    sessions[token] = { userId: user.id };
    // in prod use secure cookie; here we return token in query for demo
    res.send(`Login success. Use this token for API calls: ${token}`);
  } catch (e) {
    console.error(e);
    res.status(500).send('cas validate failed: ' + (e.message||e));
  }
});
// middleware to attach user by token header 'x-session'
app.use(async (req, res, next) => {
  const token = req.headers['x-session'];
  if (token && sessions[token]) {
    req.user = sessions[token];
  }
  next();
});
// Events CRUD
app.get('/api/events', async (req, res) => {
  const uid = req.user ? req.user.userId : null;
  if (!uid) return res.status(401).json({ error: 'unauthenticated - provide header x-session' });
  const evs = await prisma.event.findMany({ where: { userId: uid }, orderBy: { startAt: 'asc' }});
  res.json({ events: evs });
});
app.post('/api/events', async (req, res) => {
  const uid = req.user ? req.user.userId : null;
  if (!uid) return res.status(401).json({ error: 'unauthenticated' });
  const data = req.body;
  try {
    const ev = await prisma.event.create({
      data: {
        userId: uid,
        title: data.title || 'Untitled',
        description: data.description || '',
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        source: data.source || 'imported',
        reminderMins: data.reminderMins || null,
        isTodo: !!data.isTodo,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
      }
    });
    res.json({ event: ev });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/events/:id', async (req, res) => {
  const uid = req.user ? req.user.userId : null;
  if (!uid) return res.status(401).json({ error: 'unauthenticated' });
  const id = Number(req.params.id);
  await prisma.event.deleteMany({ where: { id, userId: uid }});
  res.json({ ok: true });
});
// conflict check
app.post('/api/events/check-conflict', async (req, res) => {
  const uid = req.user ? req.user.userId : null;
  if (!uid) return res.status(401).json({ error: 'unauthenticated' });
  const { startAt, endAt } = req.body;
  const conflicts = await prisma.event.findMany({
    where: {
      userId: uid,
      AND: [
        { startAt: { lt: new Date(endAt) }},
        { endAt: { gt: new Date(startAt) }}
      ]
    }
  });
  res.json({ conflicts });
});
// placeholder scraper endpoints (must be implemented with user-provided credentials)
app.post('/api/import/jw', async (req, res) => {
  res.json({ ok: false, msg: 'jw.ustc.edu.cn import requires implementing scraper with user auth. See README.'});
});
app.post('/api/import/young', async (req, res) => {
  res.json({ ok: false, msg: 'young.ustc.edu.cn import requires implementing scraper with user auth. See README.'});
});
const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Backend started on', port));
