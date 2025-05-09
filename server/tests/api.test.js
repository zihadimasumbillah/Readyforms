const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { sequelize, User, Topic, Tag, Template } = require('../src/models');

let adminToken = '';
let userToken = '';
let adminId = '';
let userId = '';
let templateId = '';
let topicId = '';
let commentId = '';
let formResponseId = '';
let tagId = '';

beforeAll(async () => {
  try {
    console.log('Setting up test database...');
    
    // Drop and recreate all tables
    await sequelize.sync({ force: true });
    
    // Create test topics
    const topic = await Topic.create({
      name: 'Test Topic',
      description: 'This is a test topic for API testing'
    });
    topicId = topic.id;
    
    // Create test tags
    const tag = await Tag.create({
      name: 'API Test'
    });
    tagId = tag.id;
    
    // Create admin user
    const hashedAdminPw = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'API Test Admin',
      email: 'api-admin@example.com',
      password: hashedAdminPw,
      isAdmin: true,
      blocked: false,
      language: 'en',
      theme: 'light',
      lastLoginAt: new Date()
    });
    adminId = admin.id;
    
    // Create regular user
    const hashedUserPw = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'API Test User',
      email: 'api-user@example.com',
      password: hashedUserPw,
      isAdmin: false,
      blocked: false,
      language: 'en',
      theme: 'dark',
      lastLoginAt: new Date()
    });
    userId = user.id;
    
    console.log('Test setup complete.');
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
});

describe('Health Check API', () => {
  test('Ping endpoint should respond', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'pong');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('Authentication API', () => {
  test('Register a new user should succeed', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Register User',
        email: 'test-register@example.com',
        password: 'password123',
        language: 'en',
        theme: 'light'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email', 'test-register@example.com');
  });
  
  test('Login with admin credentials should succeed', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'api-admin@example.com',
        password: 'admin123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('isAdmin', true);
    adminToken = res.body.token;
  });
  
  test('Login with user credentials should succeed', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'api-user@example.com',
        password: 'user123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('isAdmin', false);
    userToken = res.body.token;
  });
  
  test('Login with incorrect password should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'api-admin@example.com',
        password: 'wrong-password'
      });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
  
  test('Get current user should return user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('email', 'api-user@example.com');
  });
  
  test('Update user preferences should succeed', async () => {
    const res = await request(app)
      .put('/api/auth/preferences')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        language: 'fr',
        theme: 'system'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('language', 'fr');
    expect(res.body.user).toHaveProperty('theme', 'system');
  });
});

describe('Topics API', () => {
  test('Get all topics should succeed', async () => {
    const res = await request(app)
      .get('/api/topics')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Create topic as admin should succeed', async () => {
    const res = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New API Topic',
        description: 'Created via API test'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('topic');
    expect(res.body.topic).toHaveProperty('name', 'New API Topic');
    
    // Save the new topic ID for the next test to use
    topicId = res.body.topic.id;
  });
  
  test('Get topic by ID should succeed', async () => {
    const res = await request(app)
      .get(`/api/topics/${topicId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', topicId);
    expect(res.body).toHaveProperty('name', 'New API Topic');
  });
  
  test('Create topic as non-admin should fail', async () => {
    const res = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Topic',
        description: 'This should fail'
      });
    
    expect(res.status).toBe(403);
  });
});

describe('Templates API', () => {
  test('Create template should succeed', async () => {
    const templateData = {
      title: 'API Test Template',
      description: 'Template created via API testing',
      isPublic: true,
      topicId: topicId,
      customString1State: true,
      customString1Question: 'What is your name?',
      customText1State: true,
      customText1Question: 'Tell us about yourself',
      customCheckbox1State: true,
      customCheckbox1Question: 'Subscribe to newsletter?',
      questionOrder: JSON.stringify(['customString1', 'customText1', 'customCheckbox1']),
      tags: ['API Test', 'Sample']
    };
    
    const res = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${userToken}`)
      .send(templateData);
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', 'API Test Template');
    templateId = res.body.id;
  });
  
  test('Get all templates should succeed', async () => {
    const res = await request(app)
      .get('/api/templates')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Get template by ID should succeed', async () => {
    const res = await request(app)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', templateId);
    expect(res.body).toHaveProperty('title', 'API Test Template');
  });
  
  test('Search templates should work', async () => {
    const res = await request(app)
      .get('/api/templates/search?query=API')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title', 'API Test Template');
  });
  
  test('Update template should succeed', async () => {
    // First get the template to get its version
    const getRes = await request(app)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    const version = getRes.body.version;
    
    const res = await request(app)
      .put(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Updated API Test Template',
        description: 'Updated template description',
        isPublic: true,
        topicId: topicId,
        customString1State: true,
        customString1Question: 'What is your full name?',
        customText1State: true,
        customText1Question: 'Tell us about yourself',
        customCheckbox1State: true,
        customCheckbox1Question: 'Subscribe to newsletter?',
        questionOrder: JSON.stringify(['customString1', 'customText1', 'customCheckbox1']),
        version: version
      });
    
    expect(res.status).toBe(200);
    expect(res.body.template).toHaveProperty('title', 'Updated API Test Template');
  });
});

describe('Form Response API', () => {
  test('Submit form response should succeed', async () => {
    const res = await request(app)
      .post('/api/responses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        templateId: templateId,
        customString1Answer: 'Test Answer',
        customText1Answer: 'This is a longer text response for testing',
        customInt1Answer: 42,
        customCheckbox1Answer: true
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    formResponseId = res.body.id;
  });
  
  test('Get responses for template should succeed', async () => {
    // First make sure we have a response by submitting another one
    if (!formResponseId) {
      const createRes = await request(app)
        .post('/api/responses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          templateId: templateId,
          customString1Answer: 'Admin Test Answer'
        });
      
      formResponseId = createRes.body.id;
    }
    
    const res = await request(app)
      .get(`/api/responses/template/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Get specific response should succeed', async () => {
    const res = await request(app)
      .get(`/api/responses/${formResponseId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', formResponseId);
  });
  
  test('Get user responses should succeed', async () => {
    // First ensure we have a response by submitting another one if needed
    if (!formResponseId) {
      const createRes = await request(app)
        .post('/api/responses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          templateId: templateId,
          customString1Answer: 'Another Test Answer'
        });
      
      formResponseId = createRes.body.id;
    }
    
    const res = await request(app)
      .get('/api/responses/user')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Get aggregate data should succeed', async () => {
    const res = await request(app)
      .get(`/api/responses/aggregate/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('responseCount'); // Changed from 'total_responses' to 'responseCount'
  });
});

describe('Comments API', () => {
  test('Create comment should succeed', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        templateId: templateId,
        content: 'This is a test comment via API testing'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    commentId = res.body.id;
  });
  
  test('Get comments for template should succeed', async () => {
    const res = await request(app)
      .get(`/api/comments/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Delete comment should succeed', async () => {
    // First get the comment to get its version
    const comment = await request(app)
      .get(`/api/comments/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    const version = comment.body[0].version;
    
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ version });
    
    expect(res.status).toBe(200);
  });
});

describe('Like API', () => {
  test('Like template should succeed', async () => {
    const res = await request(app)
      .post(`/api/likes/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('liked', true);
  });
  
  test('Check like status should return true', async () => {
    const res = await request(app)
      .get(`/api/likes/check/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('liked', true);
  });
  
  test('Count likes should work', async () => {
    const res = await request(app)
      .get(`/api/likes/count/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count', 1);
  });
  
  test('Get likes by template should work', async () => {
    const res = await request(app)
      .get(`/api/likes/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('likesCount', 1);
  });
  
  test('Unlike template should succeed', async () => {
    const res = await request(app)
      .delete(`/api/likes/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('liked', false);
  });
});

describe('Admin API', () => {
  test('Get users as admin should succeed', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });
  
  test('Get dashboard stats as admin should succeed', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('templates');
    expect(res.body).toHaveProperty('responses');
  });
  
  test('Access admin API as non-admin should fail', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(403);
  });
});

describe('Dashboard API', () => {
  test('Get user stats should succeed', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('templates');
    expect(res.body).toHaveProperty('responses');
  });
});

describe('Clean up & test template deletion', () => {
  test('Delete template should succeed', async () => {
    // First get the template to get current version
    const getRes = await request(app)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    const version = getRes.body.version;
    
    const res = await request(app)
      .delete(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ version });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Template deleted successfully');
  });
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
  try {
    await sequelize.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});
