const request = require('supertest');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const setupTestDb = require('./setup-test-db').default;

// Create a dedicated test database connection
let sequelize;
let server;
let User, Topic, Tag, Template;

let adminToken = '';
let userToken = '';
let adminId = '';
let userId = '';
let templateId = '';
let topicId = '';
let commentId = '';
let formResponseId = '';
let tagId = '';

// Increase timeout for beforeAll
jest.setTimeout(120000); // 120 seconds timeout for database setup

beforeAll(async () => {
  try {
    console.log('Setting up test database...');
    
    // Set test environment flag to prevent automatic model initialization
    process.env.NODE_ENV = 'test';
    
    // Make sure test database exists first
    const dbSetupSuccess = await setupTestDb();
    if (!dbSetupSuccess) {
      throw new Error('Failed to set up test database');
    }
    
    // Database connection parameters from environment variables
    const dbName = process.env.TEST_DB_NAME || 'readyforms_test';
    const username = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432');
    
    // Initialize a fresh database connection for tests
    sequelize = new Sequelize(
      dbName,
      username,
      password,
      {
        host,
        port,
        dialect: 'postgres',
        logging: process.env.TEST_LOGS === 'true',
        define: {
          timestamps: true,
          version: true
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 60000,
          idle: 10000
        }
      }
    );
    
    // Verify connection
    await sequelize.authenticate();
    console.log('Test database connection established successfully.');
    
    // Important: Initialize models before importing anything else
    console.log('Initializing models with test database connection...');
    try {
      // First, ensure Sequelize constructor is accessible on the instance
      sequelize.Sequelize = Sequelize;
      
      // We need to add these methods to the sequelize instance for model initialization
      if (!sequelize.getQueryInterface) {
        sequelize.getQueryInterface = function() {
          if (!this._queryInterface) {
            const QueryInterface = require('sequelize/lib/query-interface');
            this._queryInterface = new QueryInterface(this);
          }
          return this._queryInterface;
        };
      }
      
      // Now load and initialize models
      const { initializeModels } = require('../dist/src/models');
      await initializeModels(sequelize);
      console.log('Models initialized for testing');
      
      // Get models after initialization to ensure we use the initialized versions
      const models = require('../dist/src/models');
      
      // Extract model references 
      User = models.User;
      Topic = models.Topic;
      Tag = models.Tag; 
      Template = models.Template;
      
      // Set up static sequelize instances on all models to ensure they work correctly
      Object.values(models).forEach(model => {
        if (!model.sequelize) model.sequelize = sequelize;
        if (!model.Sequelize) model.Sequelize = Sequelize;
      });
      
      // Double-check models were properly initialized
      if (!User || !Topic || !Template || !Tag) {
        throw new Error('Models were not properly exported after initialization');
      }
    } catch (modelError) {
      console.error('Error initializing models:', modelError);
      throw new Error('Failed to initialize models: ' + modelError.message);
    }
    
    // Sync all models to ensure tables exist
    try {
      await sequelize.sync({ force: true });
      console.log('Models synchronized with database');
    } catch (syncError) {
      console.error('Error syncing models:', syncError);
      throw new Error('Failed to sync models with database: ' + syncError.message);
    }
    
    // Only import server after models are initialized and ready
    server = require('./server');
    
    // Create initial test data
    
    // Create or find the test topic
    try {
      const topicData = {
        name: 'Test Topic',
        description: 'This is a test topic for API testing'
      };
      
      console.log('Creating topic with data:', topicData);
      
      // Use the Topic model to create topic properly
      const topic = await Topic.create(topicData);
      
      topicId = topic.id;
      console.log('Created test topic using model:', topicId);
    } catch (topicError) {
      console.error('Error creating test topic:', topicError.message);
      
      // Try to find an existing topic instead
      try {
        console.log('Attempting to find an existing topic...');
        const existingTopic = await Topic.findOne({
          where: { name: 'Test Topic' }
        });
        
        if (existingTopic) {
          topicId = existingTopic.id;
          console.log('Found existing topic:', topicId);
        } else {
          console.warn('Using a placeholder topic ID to continue tests');
          topicId = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        console.warn('Using a placeholder topic ID to continue tests');
        topicId = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID
      }
    }

    // Create a tag
    try {
      const tag = await Tag.create({
        name: 'API Test'
      });
      tagId = tag.id;
      console.log('Created test tag:', tag.name, tagId);
    } catch (tagError) {
      console.error('Failed to create tag:', tagError.message);
      throw new Error('Failed to create tag: ' + tagError.message);
    }

    // Create admin user
    try {
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
      console.log('Created admin user:', admin.id);
      adminId = admin.id;
    } catch (error) {
      console.error('Error creating admin user:', error.message);
      throw new Error('Failed to create admin user: ' + error.message);
    }

    // Create regular user
    try {
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
      console.log('Created regular user:', user.id);
      userId = user.id;
    } catch (error) {
      console.error('Error creating regular user:', error.message);
      throw new Error('Failed to create regular user: ' + error.message);
    }
    
    console.log('Test setup complete.');
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
});

describe('Health Check API', () => {
  test('Root API endpoint should respond', async () => {
    const res = await request(server).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'ReadyForms API');
  });

  test('Ping endpoint should respond', async () => {
    const res = await request(server).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'pong');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('Health status endpoint should respond', async () => {
    const res = await request(server).get('/api/health/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('Authentication API', () => {
  test('Register a new user should succeed', async () => {
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
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
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'api-admin@example.com',
        password: 'wrong-password'
      });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
  
  test('Get current user should return user profile', async () => {
    const res = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', userId);
    expect(res.body).toHaveProperty('email', 'api-user@example.com');
  });
  
  test('Update user preferences should succeed', async () => {
    const res = await request(server)
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
    const res = await request(server)
      .get('/api/topics')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Create topic as admin should succeed', async () => {
    const res = await request(server)
      .post('/api/topics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New API Topic',
        description: 'Created via API test'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('topic');
    expect(res.body.topic).toHaveProperty('name', 'New API Topic');
  });
  
  test('Get topic by ID should succeed', async () => {
    const res = await request(server)
      .get(`/api/topics/${topicId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', topicId);
    expect(res.body).toHaveProperty('name', 'Test Topic');
  });
  
  test('Create topic as non-admin should fail', async () => {
    const res = await request(server)
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
      ...(tagId ? { tags: ['API Test'] } : {})
    };
    
    const res = await request(server)
      .post('/api/templates')
      .set('Authorization', `Bearer ${userToken}`)
      .send(templateData);
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('title', 'API Test Template');
    templateId = res.body.id;
  });
  
  test('Get all templates should succeed', async () => {
    const res = await request(server)
      .get('/api/templates')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Get template by ID should succeed', async () => {
    const res = await request(server)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', templateId);
    expect(res.body).toHaveProperty('title', 'API Test Template');
  });
  
  test('Search templates should work', async () => {
    const res = await request(server)
      .get('/api/templates/search?query=API')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('title', 'API Test Template');
  });
  
  test('Update template should succeed', async () => {
    const getRes = await request(server)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    const version = getRes.body.version;
    
    const res = await request(server)
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
    const res = await request(server)
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
    if (!formResponseId) {
      const createRes = await request(server)
        .post('/api/responses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          templateId: templateId,
          customString1Answer: 'Admin Test Answer'
        });
      
      formResponseId = createRes.body.id;
    }
    
    const res = await request(server)
      .get(`/api/responses/template/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Get specific response should succeed', async () => {
    const res = await request(server)
      .get(`/api/responses/${formResponseId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', formResponseId);
  });
  
  test('Get user responses should succeed', async () => {
    if (!formResponseId) {
      const createRes = await request(server)
        .post('/api/responses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          templateId: templateId,
          customString1Answer: 'Another Test Answer'
        });
      
      formResponseId = createRes.body.id;
    }
    
    const res = await request(server)
      .get('/api/responses/user')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Get aggregate data should succeed', async () => {
    const res = await request(server)
      .get(`/api/responses/aggregate/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_responses');
  });
});

describe('Comments API', () => {
  test('Create comment should succeed', async () => {
    const res = await request(server)
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
    const res = await request(server)
      .get(`/api/comments/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Delete comment should succeed', async () => {
    const comment = await request(server)
      .get(`/api/comments/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    const version = comment.body[0].version;
    
    const res = await request(server)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ version });
    
    expect(res.status).toBe(200);
  });
});

describe('Like API', () => {
  test('Like template should succeed', async () => {
    const res = await request(server)
      .post(`/api/likes/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('liked', true);
  });
  
  test('Check like status should return true', async () => {
    const res = await request(server)
      .get(`/api/likes/check/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('liked', true);
  });
  
  test('Count likes should work', async () => {
    const res = await request(server)
      .get(`/api/likes/count/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count', 1);
  });
  
  test('Get likes by template should work', async () => {
    const res = await request(server)
      .get(`/api/likes/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('likesCount', 1);
  });
  
  test('Unlike template should succeed', async () => {
    const res = await request(server)
      .delete(`/api/likes/template/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('liked', false);
  });
});

describe('Admin API', () => {
  test('Get users as admin should succeed', async () => {
    const res = await request(server)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThan(0);
  });
  
  test('Get dashboard stats as admin should succeed', async () => {
    const res = await request(server)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('templates');
    expect(res.body).toHaveProperty('responses');
  });
  
  test('Access admin API as non-admin should fail', async () => {
    const res = await request(server)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(403);
  });
});

describe('Dashboard API', () => {
  test('Get user stats should succeed', async () => {
    const res = await request(server)
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
    const getRes = await request(server)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    const version = getRes.body.version;
    
    const res = await request(server)
      .delete(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ version });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Template deleted successfully');
  });
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
  
  // Close the server first
  if (server && server.close) {
    await new Promise((resolve) => {
      server.close((err) => {
        if (err) {
          console.error('Error closing server:', err);
        } else {
          console.log('Test server closed');
        }
        resolve();
      });
    });
  }
  
  // Now close the database connection
  if (sequelize) {
    try {
      await sequelize.close();
      console.log('Test database connection closed');
    } catch (dbError) {
      console.error('Error closing database connection:', dbError.message);
    }
  }
});
