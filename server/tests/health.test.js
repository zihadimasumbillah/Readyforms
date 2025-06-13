const request = require('supertest');
const server = require('./server');

describe('Health Check API', () => {
  test('Root endpoint should respond with API info', async () => {
    const res = await request(server).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'ReadyForms API');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('Ping endpoint should respond with pong', async () => {
    const res = await request(server).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'pong');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('Status endpoint should return ok status', async () => {
    const res = await request(server).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('Health ping endpoint should respond', async () => {
    const res = await request(server).get('/api/health/ping');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message', 'API server is running');
  });

  test('Health default route should respond', async () => {
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('Health status endpoint should respond', async () => {
    const res = await request(server).get('/api/health/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('Database health check should respond', async () => {
    const res = await request(server).get('/api/health/database');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    // Note: We don't assert it's always 'ok' since the test database might not be available
  });

  test('CORS health check should respond', async () => {
    const res = await request(server).get('/api/health/cors');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('cors_config');
  });

  test('Full health check should respond', async () => {
    const res = await request(server).get('/api/health/full');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('api_status');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('environment');
  });
});
