const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Password123!'
};

// Global variables to store test data
let authToken;
let adminUserId;
let testTopicId;
let testTemplateId;
let testTemplateVersion;
let regularUserId;

// Helper function to make authenticated API requests
const authRequest = async (method, endpoint, data = null) => {
  const headers = { Authorization: `Bearer ${authToken}` };
  const config = { headers };
  
  try {
    let response;
    if (method === 'get') {
      response = await axios.get(`${API_URL}${endpoint}`, config);
    } else if (method === 'post') {
      response = await axios.post(`${API_URL}${endpoint}`, data, config);
    } else if (method === 'put') {
      response = await axios.put(`${API_URL}${endpoint}`, data, config);
    } else if (method === 'delete') {
      response = await axios.delete(`${API_URL}${endpoint}`, { ...config, data });
    }
    return response.data;
  } catch (error) {
    console.error(`Error in ${method.toUpperCase()} request to ${endpoint}:`, 
      error.response?.data || error.message);
    throw error;
  }
};

// Login as admin and get token
const loginAsAdmin = async () => {
  try {
    console.log('Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    authToken = response.data.token;
    
    // Get admin user details
    const userData = await authRequest('get', '/auth/me');
    adminUserId = userData.id;
    
    console.log('Admin login successful');
    return true;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    return false;
  }
};

// Get a topic ID to use for testing
const getTestTopic = async () => {
  try {
    console.log('Getting a topic for test templates...');
    const topics = await authRequest('get', '/topics');
    if (topics && topics.length > 0) {
      testTopicId = topics[0].id;
      console.log(`Using topic: ${topics[0].name} (${testTopicId})`);
      return true;
    } else {
      console.error('No topics found. Please seed the database first.');
      return false;
    }
  } catch (error) {
    console.error('Failed to get topics:', error.response?.data || error.message);
    return false;
  }
};

// Get a regular user for admin operations
const getRegularUser = async () => {
  try {
    console.log('Getting a regular user for admin operations...');
    const users = await authRequest('get', '/users');
    
    // Find a non-admin user
    const regularUser = users.find(user => !user.isAdmin);
    
    if (regularUser) {
      regularUserId = regularUser.id;
      console.log(`Using regular user: ${regularUser.name} (${regularUserId})`);
      return true;
    } else {
      console.error('No regular users found. Please seed the database first.');
      return false;
    }
  } catch (error) {
    console.error('Failed to get users:', error.response?.data || error.message);
    return false;
  }
};

// Create a test template with optimistic locking
const createTemplate = async () => {
  try {
    console.log('Creating a test template...');
    
    const templateData = {
      title: `Test Template ${new Date().toISOString()}`,
      description: 'Template created by admin-template-test script',
      isPublic: true,
      topicId: testTopicId,
      customString1State: true,
      customString1Question: 'What is your name?',
      customText1State: true,
      customText1Question: 'Please provide feedback',
      customInt1State: true,
      customInt1Question: 'Rate our service (1-10)',
      customCheckbox1State: true,
      customCheckbox1Question: 'Subscribe to newsletter?',
      questionOrder: JSON.stringify([
        'customString1',
        'customText1',
        'customInt1',
        'customCheckbox1'
      ])
    };
    
    const result = await authRequest('post', '/templates', templateData);
    testTemplateId = result.id;
    testTemplateVersion = result.version;
    
    console.log(`Template created successfully with ID: ${testTemplateId} and version: ${testTemplateVersion}`);
    return true;
  } catch (error) {
    console.error('Failed to create template:', error.response?.data || error.message);
    return false;
  }
};

// Update the test template with optimistic locking
const updateTemplate = async () => {
  try {
    console.log('Updating the test template...');
    
    const templateData = {
      title: `Updated Template ${new Date().toISOString()}`,
      description: 'Updated by admin-template-test script',
      isPublic: true,
      topicId: testTopicId,
      version: testTemplateVersion, // Important for optimistic locking
      customString1State: true,
      customString1Question: 'What is your full name?',
      customText1State: true,
      customText1Question: 'Please provide detailed feedback',
      customInt1State: true,
      customInt1Question: 'How likely are you to recommend us? (1-10)',
      customCheckbox1State: true,
      customCheckbox1Question: 'Would you like to receive our newsletter?',
      questionOrder: JSON.stringify([
        'customString1',
        'customInt1',
        'customText1',
        'customCheckbox1'
      ])
    };
    
    const result = await authRequest('put', `/templates/${testTemplateId}`, templateData);
    testTemplateVersion = result.version;
    
    console.log(`Template updated successfully. New version: ${testTemplateVersion}`);
    return true;
  } catch (error) {
    console.error('Failed to update template:', error.response?.data || error.message);
    return false;
  }
};

// Delete the test template with optimistic locking
const deleteTemplate = async () => {
  try {
    console.log('Deleting the test template...');
    console.log(`Using template version: ${testTemplateVersion} for deletion`);
    
    // Make sure the version is passed as a proper object in the request body
    const deleteData = { version: testTemplateVersion };
    await authRequest('delete', `/templates/${testTemplateId}`, deleteData);
    
    console.log('Template deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete template:', error.response?.data || error.message);
    return false;
  }
};

// Toggle user block status
const toggleUserBlock = async () => {
  try {
    console.log(`Testing toggle block status for user: ${regularUserId}`);
    
    // Get current status
    const users = await authRequest('get', '/users');
    const user = users.find(u => u.id === regularUserId);
    const wasBlocked = user.blocked;
    
    // Toggle block status - correct endpoint format
    const result = await authRequest('put', `/users/${regularUserId}/block`);
    
    // Verify the change
    const updatedUsers = await authRequest('get', '/users');
    const updatedUser = updatedUsers.find(u => u.id === regularUserId);
    
    if (updatedUser.blocked !== wasBlocked) {
      console.log(`Successfully ${updatedUser.blocked ? 'blocked' : 'unblocked'} user`);
      
      // Revert back to original state
      await authRequest('put', `/users/${regularUserId}/block`);
      console.log('Reverted user block status to original state');
      return true;
    } else {
      console.error('User block status did not change');
      return false;
    }
  } catch (error) {
    console.error('Failed to toggle user block status:', error.response?.data || error.message);
    return false;
  }
};

// Toggle user admin status
const toggleUserAdmin = async () => {
  try {
    console.log(`Testing toggle admin status for user: ${regularUserId}`);
    
    // Get current status
    const users = await authRequest('get', '/users');
    const user = users.find(u => u.id === regularUserId);
    const wasAdmin = user.isAdmin;
    
    // Toggle admin status - correct endpoint format
    const result = await authRequest('put', `/users/${regularUserId}/admin`);
    
    // Verify the change
    const updatedUsers = await authRequest('get', '/users');
    const updatedUser = updatedUsers.find(u => u.id === regularUserId);
    
    if (updatedUser.isAdmin !== wasAdmin) {
      console.log(`Successfully ${updatedUser.isAdmin ? 'granted' : 'revoked'} admin privileges`);
      
      // Revert back to original state
      await authRequest('put', `/users/${regularUserId}/admin`);
      console.log('Reverted user admin status to original state');
      return true;
    } else {
      console.error('User admin status did not change');
      return false;
    }
  } catch (error) {
    console.error('Failed to toggle user admin status:', error.response?.data || error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('Starting Admin Template Tests...');

  // Login as admin
  if (!await loginAsAdmin()) {
    console.error('Failed to login as admin. Aborting tests.');
    return;
  }

  // Get a topic for test templates
  if (!await getTestTopic()) {
    console.error('Failed to get a topic. Aborting tests.');
    return;
  }

  // Get a regular user for admin operations
  if (!await getRegularUser()) {
    console.error('Failed to get a regular user. Aborting tests.');
    return;
  }
  
  // Test template operations with optimistic locking
  console.log('\n--- Testing Template Operations ---');
  if (await createTemplate()) {
    if (await updateTemplate()) {
      await deleteTemplate();
    }
  }
  
  // Test user admin operations
  console.log('\n--- Testing User Admin Operations ---');
  await toggleUserBlock();
  await toggleUserAdmin();
  
  console.log('\nAll admin template tests completed!');
};

// Run the tests
runTests().catch(error => {
  console.error('Test failed: ', error.message);
  process.exit(1);
});