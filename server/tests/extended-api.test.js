const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { sequelize, User, Topic, Tag, Template } = require('../src/models');

let adminToken = '';
let userToken = '';
let testUserId = '';
let testTemplateId = '';
let testTopicId = '';
let testTagId = '';

beforeAll(async () => {
  try {
    console.log('Setting up extended API test database...');
    
    // Create test users for admin operations
    const hashedPw = await bcrypt.hash('test123', 10);
    const testUser = await User.create({
      name: 'Test User for Admin Ops',
      email: 'admin-ops-test@example.com',
      password: hashedPw,
      isAdmin: false,
      blocked: false,
      language: 'en',
      theme: 'light'
    });
    testUserId = testUser.id;
    
    // Login as admin and regular user
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'api-admin@example.com',
        password: 'admin123'
      });
    adminToken = adminRes.body.token;
    
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'api-user@example.com',
        password: 'user123'
      });
    userToken = userRes.body.token;
    
    // Create a test topic
    const topic = await Topic.create({
      name: 'Extended API Test Topic',
      description: 'For extended API testing'
    });
    testTopicId = topic.id;
    
    // Create a test tag
    const tag = await Tag.create({
      name: 'Extended API Test'
    });
    testTagId = tag.id;
    
    console.log('Extended API test setup complete');
  } catch (error) {
    console.error('Error in extended API test setup:', error);
    throw error;
  }
});

describe('Admin User Management API', () => {
  test('Admin should get all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });
  
  test('Admin should get user by ID', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testUserId);
    expect(res.body).toHaveProperty('email', 'admin-ops-test@example.com');
  });
  
  test('Admin should toggle user block status', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${testUserId}/block`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('blocked');
    
    // Toggle back to unblocked for subsequent tests
    if (res.body.blocked) {
      await request(app)
        .put(`/api/admin/users/${testUserId}/block`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });
  
  test('Admin should toggle user admin status', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${testUserId}/admin`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('isAdmin');
    
    // Toggle back to non-admin for subsequent tests
    if (res.body.isAdmin) {
      await request(app)
        .put(`/api/admin/users/${testUserId}/admin`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });
  
  test('Admin should get users count', async () => {
    const res = await request(app)
      .get('/api/admin/users-count')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
    expect(typeof res.body.count).toBe('number');
    expect(res.body.count).toBeGreaterThan(0);
  });
});

describe('Admin Dashboard & Analytics API', () => {
  test('Admin should get dashboard statistics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('templates');
    expect(res.body).toHaveProperty('responses');
  });
  
  test('Admin should get system activity', async () => {
    const res = await request(app)
      .get('/api/admin/system-activity')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  test('Admin should get system activity with count parameter', async () => {
    const res = await request(app)
      .get('/api/admin/system-activity/5')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });
});

describe('Admin Templates Management API', () => {
  // Create a template first
  beforeAll(async () => {
    const templateData = {
      title: 'Admin API Test Template',
      description: 'Template for testing admin API',
      isPublic: true,
      topicId: testTopicId,
      customString1State: true,
      customString1Question: 'Test question 1?',
      tags: ['Extended API Test']
    };
    
    const res = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(templateData);
    
    testTemplateId = res.body.id;
  });
  
  test('Admin should get all templates', async () => {
    const res = await request(app)
      .get('/api/admin/templates')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Admin should get template by ID', async () => {
    const res = await request(app)
      .get(`/api/admin/templates/${testTemplateId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testTemplateId);
    expect(res.body).toHaveProperty('title', 'Admin API Test Template');
  });
});

describe('Admin Form Responses Management API', () => {
  // Create a form response first
  beforeAll(async () => {
    if (testTemplateId) {
      const res = await request(app)
        .post('/api/responses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          templateId: testTemplateId,
          customString1Answer: 'Admin Form Response'
        });
    }
  });
  
  test('Admin should get all form responses', async () => {
    const res = await request(app)
      .get('/api/admin/responses')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Tag Management API', () => {
  test('Get all tags should succeed', async () => {
    const res = await request(app)
      .get('/api/tags')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Create tag as admin should succeed', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Extended API Tag'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'New Extended API Tag');
  });
  
  test('Create tag as non-admin should fail', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Tag Create'
      });
    
    expect(res.status).toBe(403);
  });
  
  test('Update tag as admin should succeed', async () => {
    const res = await request(app)
      .put(`/api/tags/${testTagId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Extended API Tag'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testTagId);
    expect(res.body).toHaveProperty('name', 'Updated Extended API Tag');
  });
});

describe('Health API', () => {
  test('Health status endpoint should return server status', async () => {
    const res = await request(app)
      .get('/api/health/status');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('database');
  });
  
  test('Health CORS check endpoint should work', async () => {
    const res = await request(app)
      .get('/api/health/cors');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('corsStatus');
  });
});

describe('Dashboard API for Regular Users', () => {
  test('Get recent activity should succeed', async () => {
    const res = await request(app)
      .get('/api/dashboard/recent')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  test('Get user templates dashboard should succeed', async () => {
    const res = await request(app)
      .get('/api/dashboard/templates')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  test('Get user responses dashboard should succeed', async () => {
    const res = await request(app)
      .get('/api/dashboard/responses')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(async () => {
  console.log('Cleaning up extended API test environment...');
  try {
    await sequelize.close();
    console.log('Extended API test database connection closed');
  } catch (error) {
    console.error('Error closing extended API test database connection:', error);
  }
});
