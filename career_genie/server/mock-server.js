import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { connectMongo, getDb } from './mongo_client.js';

const PORT = process.env.MOCK_PORT || 5178;
const DATA_PATH = path.join(process.cwd(), 'server', 'data.json');
const PYTHON_CMD = process.env.PYTHON_PATH || 'python';
const AI_ANALYZER_SCRIPT = path.join(process.cwd(), 'server', 'ai', 'analysis.py');

async function analyzeResumeWithPython(contentBase64, fileName) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_CMD, [AI_ANALYZER_SCRIPT], { stdio: ['pipe', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];

    child.stdout.on('data', chunk => stdout.push(chunk));
    child.stderr.on('data', chunk => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      const output = Buffer.concat(stdout).toString('utf8').trim();
      const errorOutput = Buffer.concat(stderr).toString('utf8').trim();
      if (code !== 0) {
        return reject(new Error(`Python analyzer failed (${code}): ${errorOutput}`));
      }
      try {
        return resolve(JSON.parse(output));
      } catch (err) {
        return reject(new Error(`Invalid JSON from analyzer: ${err.message} ${output}`));
      }
    });

    child.stdin.write(JSON.stringify({ contentBase64, fileName }));
    child.stdin.end();
  });
}

function simulateResumeAnalysis() {
  return {
    score: 76,
    strengths: ['Clear project descriptions with strong frontend focus.', 'Demonstrates collaboration and modern tooling awareness.'],
    weaknesses: ['Limited cloud deployment detail.', 'No explicit backend testing framework shown.'],
    suggestions: ['Add a Docker or cloud deployment example.', 'Mention testing tools or automation experience.'],
    skills: ['Git', 'Docker'],
    atsScore: 72
  };
}

async function tryAnalyzeResume(contentBase64, fileName) {
  try {
    return await analyzeResumeWithPython(contentBase64, fileName);
  } catch (err) {
    // If AI integration is not configured or fails, fall back to the existing simulated analyzer.
    // eslint-disable-next-line no-console
    console.warn('Resume analysis AI integration failed:', err.message || err);
    return simulateResumeAnalysis();
  }
}

function getInitialData() {
  return {
    users: [
      { id: 'usr_student', name: 'Olivia Chen', email: 'olivia@gmail.com', role: 'student', skills: ['React','JavaScript'], resumeUploaded: true, resumeName: 'Olivia_Chen_Resume_2026.pdf', resumeScore: 84, feedback: {}, atsScore: 84 },
      { id: 'usr_recruiter', name: 'David Miller', email: 'david@stripe.com', role: 'recruiter' },
      { id: 'usr_admin', name: 'Alex Mercer', email: 'admin@careergenie.com', role: 'admin' }
    ],
    jobs: [
      { id: 'job_1', title: 'Frontend Engineer', company: 'Acme', location: 'Remote', tags: ['React','JavaScript'], description: 'Build great UIs.', status: 'active' }
    ],
    applications: [],
    resumeResults: {}
  };
}

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
  const { jobId, studentId, fileName, contentBase64 } = job;
  try {
    const delay = 1500 + Math.floor(Math.random() * 2500);
    await new Promise(r => setTimeout(r, delay));
    const analysis = await tryAnalyzeResume(contentBase64, fileName);
    const score = Number.isFinite(analysis.score) ? analysis.score : 70;

    const d = await readData();
    const user = d.users.find(u => u.id === studentId);
    if (user) {
      user.resumeUploaded = true;
      user.resumeName = fileName;
      user.resumeScore = score;
      user.skills = Array.from(new Set([...(user.skills || []), ...(analysis.skills || [])]));
      user.feedback = {
        score,
        strengths: analysis.strengths || ['Clear projects'],
        weaknesses: analysis.weaknesses || ['Add Docker'],
        suggestions: analysis.suggestions || ['Add testing examples']
      };
      user.atsScore = Number.isFinite(analysis.atsScore)
        ? analysis.atsScore
        : Math.round((user.resumeScore || 0) * 0.95);
    }
    d.resumeResults = d.resumeResults || {};
    d.resumeResults[jobId] = {
      status: 'done',
      studentId,
      fileName,
      score,
      finishedAt: new Date().toISOString(),
      analysis: {
        skills: analysis.skills || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        suggestions: analysis.suggestions || []
      }
    };
    await writeData(d);
  } catch (err) {
    try {
      const d2 = await readData();
      d2.resumeResults = d2.resumeResults || {};
      d2.resumeResults[jobId] = { status: 'error', error: 'processing error', detail: err.message, finishedAt: new Date().toISOString() };
      await writeData(d2);
    } catch { /* swallow */ }
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
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    const db = await connectMongo(mongoUri);
    const [usersCount, jobsCount, appsCount, resumeCount] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('jobs').countDocuments(),
      db.collection('applications').countDocuments(),
      db.collection('resumeResults').countDocuments()
    ]);
    if (usersCount + jobsCount + appsCount + resumeCount === 0) {
      const initial = getInitialData();
      await db.collection('users').insertMany(initial.users);
      await db.collection('jobs').insertMany(initial.jobs);
      await db.collection('applications').insertMany(initial.applications);
      await db.collection('resumeResults').deleteMany({});
    }
    return;
  }
  try {
    await fs.access(DATA_PATH);
  } catch {
    const initial = getInitialData();
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(initial, null, 2));
  }
}

async function readData() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    await ensureData();
    const db = getDb();
    const users = await db.collection('users').find().toArray();
    const jobs = await db.collection('jobs').find().toArray();
    const applications = await db.collection('applications').find().toArray();
    const rrDocs = await db.collection('resumeResults').find().toArray();
    const resumeResults = {};
    for (const d of rrDocs) { const { jobId, _id, ...rest } = d; if (jobId) resumeResults[jobId] = rest; }
    return { users: users || [], jobs: jobs || [], applications: applications || [], resumeResults };
  }
  await ensureData();
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    // recover from corrupted or empty file by reinitializing
    const initial = getInitialData();
    await writeData(initial);
    return initial;
  }
}

async function writeData(data) {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    await ensureData();
    const db = getDb();
    // Replace collections atomically by clearing and inserting
    if (Array.isArray(data.users)) {
      const col = db.collection('users');
      await col.deleteMany({});
      if (data.users.length) await col.insertMany(data.users.map(u => ({ ...u })));
    }
    if (Array.isArray(data.jobs)) {
      const col = db.collection('jobs');
      await col.deleteMany({});
      if (data.jobs.length) await col.insertMany(data.jobs.map(j => ({ ...j })));
    }
    if (Array.isArray(data.applications)) {
      const col = db.collection('applications');
      await col.deleteMany({});
      if (data.applications.length) await col.insertMany(data.applications.map(a => ({ ...a })));
    }
    if (data.resumeResults && typeof data.resumeResults === 'object') {
      const col = db.collection('resumeResults');
      await col.deleteMany({});
      const docs = Object.entries(data.resumeResults).map(([k, v]) => ({ jobId: k, ...v }));
      if (docs.length) await col.insertMany(docs);
    }
    return;
  }
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
    } catch {
      // try next secret if present
    }
  }
  return res.status(401).json({ error: 'invalid token' });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function setupRoutes(app) {
  // Auth: register
  app.post('/api/auth/register', asyncHandler(async (req, res) => {
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
  }));

  // Auth: login
  app.post('/api/auth/login', asyncHandler(async (req, res) => {
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
  }));

  // Jobs list
  app.get('/api/jobs', asyncHandler(async (req, res) => {
    const data = await readData();
    res.json({ jobs: data.jobs });
  }));

  // Create job (recruiter)
  app.post('/api/jobs', authMiddleware, asyncHandler(async (req, res) => {
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
  }));

  // Applications
  app.get('/api/applications', authMiddleware, asyncHandler(async (req, res) => {
    const data = await readData();
    if (req.user.role === 'student') {
      const apps = data.applications.filter(a => a.studentId === req.user.sub);
      return res.json({ applications: apps });
    }
    return res.json({ applications: data.applications });
  }));

  app.post('/api/applications', authMiddleware, asyncHandler(async (req, res) => {
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
  }));

  // Resume upload
  app.post('/api/resume', authMiddleware, asyncHandler(async (req, res) => {
    const { studentId, fileName, contentBase64 } = req.body || {};
    if (!studentId || !fileName || !contentBase64) return res.status(400).json({ error: 'studentId, fileName and contentBase64 required' });
    if (req.user.role !== 'admin' && req.user.sub !== studentId) return res.status(403).json({ error: 'forbidden' });

    const jobId = generateId('scan');
    const data = await readData();
    data.resumeResults = data.resumeResults || {};
    data.resumeResults[jobId] = { status: 'pending', studentId, fileName, startedAt: new Date().toISOString() };
    await writeData(data);
    const job = { jobId, studentId, fileName, contentBase64 };
    if (inprocProcessing < INPROC_CONCURRENCY) {
      inprocProcessing += 1;
      processInprocJob(job);
    } else {
      inprocQueue.push(job);
    }

    return res.status(202).json({ jobId, status: 'pending' });
  }));

  app.get('/api/resume/status/:jobId', authMiddleware, asyncHandler(async (req, res) => {
    const jobId = req.params.jobId;
    const data = await readData();
    const results = data.resumeResults || {};
    const job = results[jobId];
    if (!job) return res.status(404).json({ error: 'job not found' });
    return res.json({ job });
  }));

  app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const data = await readData();
    const user = data.users.find(u => u.id === id);
    if (user) { const safe = { ...user }; delete safe.passwordHash; return res.json({ user: safe }); }
    return res.status(404).json({ error: 'user not found' });
  });

  // Health and readiness endpoints
  app.get('/health', (req, res) => {
    return res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  app.get('/ready', async (req, res) => {
    try {
      // Check data accessibility and basic queue health
      await ensureData();
      if (process.env.MONGODB_URI) {
        const db = getDb();
        await db.command({ ping: 1 });
      }
      const backlog = inprocQueue.length;
      const processing = inprocProcessing;
      // If the queue is extremely large treat as not ready (simple heuristic)
      const ready = backlog < 100;
      return res.json({ ready, backlog, processing, timestamp: new Date().toISOString() });
    } catch {
      return res.status(500).json({ ready: false, error: 'readiness check failed' });
    }
  });

  // Simple Prometheus-style metrics (text/plain)
  app.get('/metrics', async (req, res) => {
    try {
      const d = await readData();
      const lines = [];
      lines.push(`# HELP career_genie_process_uptime_seconds Process uptime in seconds`);
      lines.push(`# TYPE career_genie_process_uptime_seconds gauge`);
      lines.push(`career_genie_process_uptime_seconds ${process.uptime()}`);
      lines.push(`# HELP career_genie_resume_queue_length Number of queued resume jobs`);
      lines.push(`# TYPE career_genie_resume_queue_length gauge`);
      lines.push(`career_genie_resume_queue_length ${inprocQueue.length}`);
      lines.push(`# HELP career_genie_resume_processing Number of currently processing jobs`);
      lines.push(`# TYPE career_genie_resume_processing gauge`);
      lines.push(`career_genie_resume_processing ${inprocProcessing}`);
      lines.push(`# HELP career_genie_users_total Total users`);
      lines.push(`# TYPE career_genie_users_total gauge`);
      lines.push(`career_genie_users_total ${Array.isArray(d.users) ? d.users.length : 0}`);
      lines.push(`# HELP career_genie_jobs_total Total jobs`);
      lines.push(`# TYPE career_genie_jobs_total gauge`);
      lines.push(`career_genie_jobs_total ${Array.isArray(d.jobs) ? d.jobs.length : 0}`);
      res.setHeader('Content-Type', 'text/plain; version=0.0.4');
      return res.send(lines.join('\n'));
    } catch {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send(`# error\n# metrics error`);
    }
  });

  app.put('/api/users/:id', authMiddleware, asyncHandler(async (req, res) => {
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
  }));

  if (process.env.NODE_ENV === 'test') {
    app.get('/api/test/error', asyncHandler(async () => {
      throw new Error('test async error');
    }));
  }

  app.use((req, res) => res.status(404).json({ error: 'not found' }));

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error('Mock server error', err);
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'internal server error' });
  });
}

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    await closeMongo();
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('Server shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
