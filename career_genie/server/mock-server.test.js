import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import { app, createApp } from './mock-server.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

let authToken;

describe('server security tests', () => {
  beforeAll(async () => {
    authToken = jwt.sign({ sub: 'usr_student', role: 'student' }, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
  });

  it('rejects missing Authorization header', async () => {
    const res = await request(app).post('/api/jobs').send({ title: 'Test', company: 'TestCo' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('missing token');
  });

  it('rejects invalid token algorithm', async () => {
    const badToken = jwt.sign({ sub: 'usr_student', role: 'student' }, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS384' });
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${badToken}`)
      .send({ title: 'Test', company: 'TestCo' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid token');
  });

  it('allows valid token to access protected route', async () => {
    const recruiterToken = jwt.sign({ sub: 'usr_recruiter', role: 'recruiter' }, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ title: 'Secure Job', company: 'SecureCo' });
    expect(res.status).toBe(201);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.title).toBe('Secure Job');
  });

  it('accepts a token signed with old JWT secret during rotation', async () => {
    const previousSecret = 'old-secret-token';
    const token = jwt.sign({ sub: 'usr_recruiter', role: 'recruiter' }, previousSecret, { expiresIn: '1h', algorithm: 'HS256' });

    const originalJwtSecret = process.env.JWT_SECRET;
    const originalJwtOldSecret = process.env.JWT_OLD_SECRET;
    try {
      process.env.JWT_SECRET = 'new-secret-token';
      process.env.JWT_OLD_SECRET = previousSecret;
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Rotated Job', company: 'RotateCo' });
      expect(res.status).toBe(201);
      expect(res.body.job).toBeDefined();
      expect(res.body.job.title).toBe('Rotated Job');
    } finally {
      process.env.JWT_SECRET = originalJwtSecret;
      process.env.JWT_OLD_SECRET = originalJwtOldSecret;
    }
  });

  it('sets secure response headers', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['permissions-policy']).toContain('geolocation=()');
  });

  it('enforces HTTPS and sets HSTS in production mode', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalFrontendOrigin = process.env.FRONTEND_ORIGIN;
    const originalJwtSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      process.env.FRONTEND_ORIGIN = 'https://example.com';
      process.env.JWT_SECRET = 'prod-secret';
      const prodApp = createApp();
      const res = await request(prodApp)
        .get('/api/jobs')
        .set('X-Forwarded-Proto', 'https');
      expect(res.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains; preload');
      expect(res.status).toBe(200);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      process.env.FRONTEND_ORIGIN = originalFrontendOrigin;
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });
});
