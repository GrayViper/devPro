import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const PORT = process.env.MOCK_PORT || 5178;
const DATA_PATH = path.join(process.cwd(), 'server', 'data.json');

function getEnvSettings() {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET || (isProduction ? null : 'dev-secret');
  const jwtOldSecret = process.env.JWT_OLD_SECRET || null;
  const allowDevAuth = process.env.ALLOW_DEV_AUTH === '1';
  const frontendOrigin = process.env.FRONTEND_ORIGIN || (isProduction ? null : '*');

  if (isProduction && !jwtSecret) {
    throw new Error('JWT_SECRET is required in production. Set JWT_SECRET before starting the server.');
  }
  if (isProduction && !frontendOrigin) {
    throw new Error('FRONTEND_ORIGIN is required in production. Set FRONTEND_ORIGIN to the allowed origin.');
  }

  return { isProduction, jwtSecret, jwtOldSecret, allowDevAuth, frontendOrigin };
}

export function createApp() {
  const { isProduction, frontendOrigin } = getEnvSettings();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(cors({
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  if (isProduction) {
    app.use((req, res, next) => {
      const proto = req.protocol || (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
      if (proto === 'https' || req.secure) {
        return next();
      }
      const host = req.headers.host || `localhost:${PORT}`;
      return res.redirect(301, `https://${host}${req.url}`);
    });
  }

  app.use(express.json({ limit: '10mb' }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });

  setupRoutes(app);
  return app;
}

const app = createApp();
export { app };

// In-process job queue
const inprocQueue = [];
let inprocProcessing = 0;
const INPROC_CONCURRENCY = Number(process.env.INPROC_CONCURRENCY) || 3;

async function processInprocJob(job) {
  const { jobId, studentId, fileName } = job;
  try {
    const delay = 2000 + Math.floor(Math.random() * 3000);
    await new Promise(r => setTimeout(r, delay));
    const score = 70 + Math.floor(Math.random() * 25);
    const d = await readData();
    const user = d.users.find(u => u.id === studentId);
    if (user) {
      user.resumeUploaded = true;
      user.resumeName = fileName;
      user.resumeScore = score;
      user.skills = Array.from(new Set([...(user.skills || []), 'Git', 'Docker']));
      user.feedback = { score, strengths: ['Clear projects'], weaknesses: ['Add Docker'], suggestions: ['Add testing examples'] };
      user.atsScore = Math.round((user.resumeScore || 0) * 0.95);
    }
    d.resumeResults = d.resumeResults || {};
    d.resumeResults[jobId] = { status: 'done', studentId, fileName, score, finishedAt: new Date().toISOString() };
    await writeData(d);
  } catch (e) {
    try {
      const d2 = await readData();
      d2.resumeResults = d2.resumeResults || {};
      d2.resumeResults[jobId] = { status: 'error', error: String(e), finishedAt: new Date().toISOString() };
      await writeData(d2);
    } catch (ee) { /* swallow */ }
  } finally {
    inprocProcessing -= 1;
    // start next job if present
    if (inprocQueue.length > 0) {
      const next = inprocQueue.shift();
      inprocProcessing += 1;
      processInprocJob(next);
    }
  }
}

async function ensureData() {
  try {
    await fs.access(DATA_PATH);
  } catch (e) {
    const initial = {
      users: [
        { id: 'usr_student', name: 'Olivia Chen', email: 'olivia@gmail.com', role: 'student', skills: ['React','JavaScript'], resumeUploaded: true, resumeName: 'Olivia_Chen_Resume_2026.pdf', resumeScore: 84, feedback: {}, atsScore: 84 },
        { id: 'usr_recruiter', name: 'David Miller', email: 'david@stripe.com', role: 'recruiter' },
        { id: 'usr_admin', name: 'Alex Mercer', email: 'admin@careergenie.com', role: 'admin' }
      ],
      jobs: [
        { id: 'job_1', title: 'Frontend Engineer', company: 'Acme', location: 'Remote', tags: ['React','JavaScript'], description: 'Build great UIs.', status: 'active' }
      ],
      applications: []
    };
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(initial, null, 2));
  }
}

async function readData() {
  await ensureData();
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    // recover from corrupted or empty file by reinitializing
    const initial = {
      users: [
        { id: 'usr_student', name: 'Olivia Chen', email: 'olivia@gmail.com', role: 'student', skills: ['React','JavaScript'], resumeUploaded: true, resumeName: 'Olivia_Chen_Resume_2026.pdf', resumeScore: 84, feedback: {}, atsScore: 84 },
        { id: 'usr_recruiter', name: 'David Miller', email: 'david@stripe.com', role: 'recruiter' },
        { id: 'usr_admin', name: 'Alex Mercer', email: 'admin@careergenie.com', role: 'admin' }
      ],
      jobs: [ { id: 'job_1', title: 'Frontend Engineer', company: 'Acme', location: 'Remote', tags: ['React','JavaScript'], description: 'Build great UIs.', status: 'active' } ],
      applications: [],
      resumeResults: {}
    };
    await writeData(initial);
    return initial;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2,9)}`;
}

function signToken(user) {
  const { jwtSecret } = getEnvSettings();
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '7d', algorithm: 'HS256' });
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: 'missing token' });
  const { jwtSecret, jwtOldSecret } = getEnvSettings();
  const secrets = [jwtSecret, jwtOldSecret].filter(Boolean);
  for (const secret of secrets) {
    try {
      const payload = jwt.verify(m[1], secret, { algorithms: ['HS256'] });
      req.user = payload;
      return next();
    } catch (e) {
      // try next secret if present
    }
  }
  return res.status(401).json({ error: 'invalid token' });
}

function setupRoutes(app) {
  // Auth: register
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const data = await readData();
    if (data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: 'email exists' });
    let user = { id: generateId('usr'), name, email, role: role || 'student' };
    if (password) {
      const pwHash = await bcrypt.hash(password, 12);
      user.passwordHash = pwHash;
    }
    data.users.unshift(user);
    await writeData(data);
    const token = signToken(user);
    const safe = { ...user }; delete safe.passwordHash;
    return res.status(201).json({ user: safe, token });
  });

  // Auth: login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password, role } = req.body || {};
    if (!email && !role) return res.status(400).json({ error: 'email or role required' });
    const data = await readData();
    const emailValue = (email || '').toLowerCase();
    const user = data.users.find(u => u.email && u.email.toLowerCase() === emailValue);

    if (user && user.passwordHash && password) {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'invalid credentials' });
      const token = signToken(user);
      const safe = { ...user }; delete safe.passwordHash;
      return res.json({ user: safe, token });
    }

    const { isProduction, allowDevAuth } = getEnvSettings();
    if (isProduction || !allowDevAuth) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    // fallback dev mode: allow login by role without password when explicitly enabled
    const fallbackUser = role ? data.users.find(u => u.role === role) : null;
    if (fallbackUser) {
      const token = signToken(fallbackUser);
      const safe = { ...fallbackUser }; delete safe.passwordHash;
      return res.json({ user: safe, token });
    }

    return res.status(401).json({ error: 'invalid credentials' });
  });

  // Jobs list
  app.get('/api/jobs', async (req, res) => {
    const data = await readData();
    res.json({ jobs: data.jobs });
  });

  // Create job (recruiter)
  app.post('/api/jobs', authMiddleware, async (req, res) => {
    const body = req.body || {};
    const data = await readData();
    // only recruiters or admins can create jobs
    if (!req.user || (req.user.role !== 'recruiter' && req.user.role !== 'admin')) return res.status(403).json({ error: 'forbidden' });
    if (!body.title || !body.company) return res.status(400).json({ error: 'title and company required' });
    const job = {
      id: generateId('job'),
      title: body.title,
      company: body.company,
      location: body.location || 'Remote',
      type: body.type || 'Full-time',
      tags: body.tags || [],
      description: body.description || '',
      salary: body.salary || 'Competitive',
      deadline: body.deadline || 'TBD',
      posterId: body.posterId || null,
      posterName: body.posterName || null,
      logo: (body.company && body.company[0]) || 'J',
      logoBg: body.logoBg || 'bg-slate-600',
      status: body.status || 'pending_approval'
    };
    data.jobs.unshift(job);
    await writeData(data);
    res.status(201).json({ job });
  });

  // Applications
  app.get('/api/applications', authMiddleware, async (req, res) => {
    const data = await readData();
    if (req.user.role === 'student') {
      const apps = data.applications.filter(a => a.studentId === req.user.sub);
      return res.json({ applications: apps });
    }
    return res.json({ applications: data.applications });
  });

  app.post('/api/applications', authMiddleware, async (req, res) => {
    const body = req.body || {};
    if (!body.studentId || !body.jobId) return res.status(400).json({ error: 'studentId and jobId required' });
    if (req.user.role !== 'student' && req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const data = await readData();
    const appObj = {
      id: generateId('app'),
      studentId: body.studentId,
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      studentSkills: body.studentSkills || [],
      jobId: body.jobId,
      jobTitle: body.jobTitle || 'Unknown',
      company: body.company || 'Unknown',
      logo: body.logo || (body.company ? body.company[0] : 'J'),
      logoBg: body.logoBg || 'bg-slate-600',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Applied',
      matchScore: body.matchScore || 0,
      history: [{ status: 'Applied', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), comment: 'Application submitted.' }]
    };
    data.applications.unshift(appObj);
    await writeData(data);
    res.status(201).json({ application: appObj });
  });

  // Resume upload
  app.post('/api/resume', authMiddleware, async (req, res) => {
    const { studentId, fileName } = req.body || {};
    if (!studentId || !fileName) return res.status(400).json({ error: 'studentId and fileName required' });
    if (req.user.role !== 'admin' && req.user.sub !== studentId) return res.status(403).json({ error: 'forbidden' });

    const jobId = generateId('scan');
    const data = await readData();
    data.resumeResults = data.resumeResults || {};
    data.resumeResults[jobId] = { status: 'pending', studentId, fileName, startedAt: new Date().toISOString() };
    await writeData(data);
    const job = { jobId, studentId, fileName };
    if (inprocProcessing < INPROC_CONCURRENCY) {
      inprocProcessing += 1;
      processInprocJob(job);
    } else {
      inprocQueue.push(job);
    }

    return res.status(202).json({ jobId, status: 'pending' });
  });

  app.get('/api/resume/status/:jobId', authMiddleware, async (req, res) => {
    const jobId = req.params.jobId;
    const data = await readData();
    const results = data.resumeResults || {};
    const job = results[jobId];
    if (!job) return res.status(404).json({ error: 'job not found' });
    return res.json({ job });
  });

  app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const data = await readData();
    const user = data.users.find(u => u.id === id);
    if (user) { const safe = { ...user }; delete safe.passwordHash; return res.json({ user: safe }); }
    return res.status(404).json({ error: 'user not found' });
  });

  app.put('/api/users/:id', authMiddleware, async (req, res) => {
    const id = req.params.id; const body = req.body || {};
    if (req.user.role !== 'admin' && req.user.sub !== id) return res.status(403).json({ error: 'forbidden' });
    const data = await readData();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...body };
      await writeData(data);
      const safe = { ...data.users[idx] }; delete safe.passwordHash;
      return res.json({ user: safe });
    }
    const created = { id, ...body };
    data.users.unshift(created);
    await writeData(data);
    return res.json({ user: created });
  });

  app.use((req, res) => res.status(404).json({ error: 'not found' }));
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
