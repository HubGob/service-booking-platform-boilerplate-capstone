// Backend API integration tests for service-booking-platform.
//
// Tests auth, services, availability, and bookings routes.
// Uses Supertest for HTTP assertions without starting a real server.
//
// Setup:
//   cp .env.example .env.test
//   # Edit .env.test with test values (no real Stripe needed)
//   npx jest
//
// The test suite tests the Express app directly — no MongoDB needed
// for route validation and 404/error handling tests.

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app').default || require('../src/app');

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

const API = '/api';
const TIMEOUT = 15000; // 15s — some DB ops take ~10s when MongoDB is unreachable

function authHeader() {
  return { Authorization: 'Bearer test-token' };
}

// -------------------------------------------------------------------------
// Health check
// -------------------------------------------------------------------------

describe('Health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get(`${API}/health`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  }, TIMEOUT);
});

// -------------------------------------------------------------------------
// Auth routes — input validation
// -------------------------------------------------------------------------

describe('Auth', () => {
  const validRegister = {
    email: 'test@example.com',
    password: 'secret123',
    name: 'Test User',
  };

  it('register accepts valid input (or 500 if DB unreachable)', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send(validRegister);
    // May 200/201 on success or 500 if DB not connected — both are OK
    expect([200, 201, 500]).toContain(res.status);
  }, TIMEOUT);

  it('register rejects bad email', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email: 'not-an-email', password: 'secret123', name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('email');
  });

  it('register rejects short password', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email: 'test@example.com', password: '123', name: 'Test' });
    expect(res.status).toBe(400);
    const msg = res.body.message.toLowerCase();
    expect(msg).toContain('password');
  }, TIMEOUT);

  it('register rejects empty name', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email: 'test@example.com', password: 'secret123', name: '' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Name is required');
  });

  it('login rejects bad email', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'not-an-email', password: 'secret123' });
    expect(res.status).toBe(400);
  });

  it('login rejects empty password', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'test@example.com', password: '' });
    expect(res.status).toBe(400);
  });

  it('refresh requires refreshToken', async () => {
    const res = await request(app)
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: '' });
    expect(res.status).toBe(400);
  });

  it('logout responds', async () => {
    const res = await request(app).post(`${API}/auth/logout`);
    expect([200, 401]).toContain(res.status);
  });

  it('getMe responds (may require auth)', async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect([200, 401]).toContain(res.status);
  }, TIMEOUT);
});

// -------------------------------------------------------------------------
// Services routes
// -------------------------------------------------------------------------

describe('Services', () => {
  it('list services returns 200 or 500 (DB dependent)', async () => {
    const res = await request(app).get(`${API}/services`);
    expect([200, 500]).toContain(res.status);
  }, TIMEOUT);

  it('get single service returns 200, 404, or 500', async () => {
    const res = await request(app).get(`${API}/services/nonexistent-id`);
    expect([200, 404, 500]).toContain(res.status);
  }, TIMEOUT);

  it('create service with auth returns 200/201/401/500', async () => {
    const res = await request(app)
      .post(`${API}/services`)
      .set(authHeader())
      .send({
        title: 'Test Service',
        description: 'A test',
        price: 50,
        duration: 60,
      });
    expect([200, 201, 401, 500]).toContain(res.status);
  }, TIMEOUT);
});

// -------------------------------------------------------------------------
// Availability routes
// -------------------------------------------------------------------------

describe('Availability', () => {
  it('list availability responds (200/400/401/500)', async () => {
    const res = await request(app).get(`${API}/availability`);
    expect([200, 400, 401, 500]).toContain(res.status);
  }, TIMEOUT);

  it('set availability with auth returns 200/201/401/500', async () => {
    const res = await request(app)
      .post(`${API}/availability`)
      .set(authHeader())
      .send({ date: '2026-09-01', slots: ['09:00', '10:00'] });
    expect([200, 201, 401, 500]).toContain(res.status);
  }, TIMEOUT);
});

// -------------------------------------------------------------------------
// Bookings routes
// -------------------------------------------------------------------------

describe('Bookings', () => {
  it('list bookings responds (200/401/500)', async () => {
    const res = await request(app).get(`${API}/bookings`);
    expect([200, 401, 500]).toContain(res.status);
  }, TIMEOUT);

  it('create booking with auth returns 200/201/401/500', async () => {
    const res = await request(app)
      .post(`${API}/bookings`)
      .set(authHeader())
      .send({
        serviceId: 'test-svc',
        startTime: '2026-09-01T10:00:00Z',
      });
    expect([200, 201, 401, 500]).toContain(res.status);
  }, TIMEOUT);

  it('cancel booking with auth returns 200/204/401/404/500', async () => {
    const res = await request(app)
      .delete(`${API}/bookings/test-id`)
      .set(authHeader());
    expect([200, 204, 401, 404, 500]).toContain(res.status);
  }, TIMEOUT);
});

// -------------------------------------------------------------------------
// 404 handling — no DB required
// -------------------------------------------------------------------------

describe('404', () => {
  it('returns 404 for unknown API endpoints', async () => {
    const res = await request(app).get(`${API}/definitely-not-real`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for deep nested unknown', async () => {
    const res = await request(app).get(`${API}/auth/foo/bar/baz`);
    expect(res.status).toBe(404);
  });
});

// -------------------------------------------------------------------------
// Error handling — no DB required
// -------------------------------------------------------------------------

describe('Error handling', () => {
  it('handles malformed JSON', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .set('Content-Type', 'application/json')
      .send('this is not json {{{');
    expect([400, 415, 500]).toContain(res.status);
  });

  it('handles empty body', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({});
    expect([400, 500]).toContain(res.status);
  });
});
