/**
 * Test utilities for API tests
 */
const request = require('supertest');

/**
 * Creates a new user for testing purposes
 * @param {object} server - HTTP server instance
 * @param {object} userData - User data to register
 * @return {Promise<object>} The created user with token
 */
async function createTestUser(server, userData = {}) {
  const defaultUserData = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    language: 'en',
    theme: 'light'
  };

  const userToCreate = { ...defaultUserData, ...userData };
  
  const response = await request(server)
    .post('/api/auth/register')
    .send(userToCreate);
    
  if (response.status !== 201) {
    throw new Error(`Failed to create test user: ${JSON.stringify(response.body)}`);
  }
  
  return {
    ...response.body.user,
    token: response.body.token
  };
}

/**
 * Logs in a user
 * @param {object} server - HTTP server instance
 * @param {string} email - User email
 * @param {string} password - User password
 * @return {Promise<string>} Authentication token
 */
async function loginUser(server, email, password) {
  const response = await request(server)
    .post('/api/auth/login')
    .send({ email, password });
    
  if (response.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(response.body)}`);
  }
  
  return response.body.token;
}

/**
 * Creates a test topic
 * @param {object} server - HTTP server instance
 * @param {string} token - Admin user token
 * @param {object} topicData - Topic data
 * @return {Promise<object>} Created topic
 */
async function createTestTopic(server, token, topicData = {}) {
  const defaultTopicData = {
    name: `Test Topic ${Date.now()}`,
    description: 'Topic created for testing'
  };

  const dataToSend = { ...defaultTopicData, ...topicData };
  
  const response = await request(server)
    .post('/api/topics')
    .set('Authorization', `Bearer ${token}`)
    .send(dataToSend);
    
  if (response.status !== 201) {
    throw new Error(`Failed to create test topic: ${JSON.stringify(response.body)}`);
  }
  
  return response.body.topic;
}

module.exports = {
  createTestUser,
  loginUser,
  createTestTopic
};
