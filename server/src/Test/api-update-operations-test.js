const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const assert = require('assert').strict;

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Password123!'
};
const USER_CREDENTIALS = {
  email: 'john@example.com',
  password: 'Password123!'
};

// Global variables to store test data
let authToken;
let adminUserId;
let regularUserToken;
let testTopicId;
let testTopicVersion;
let testTopicName;
let testTemplateId;
let testTemplateVersion;
let testTemplateTitle;
let testFormResponseId;
let testFormResponseVersion;
let testCommentId;
let testCommentVersion;
let regularUserId;
let testPassword = 'TestPassword123!';

// Helper function to make authenticated API requests
const authRequest = async (method, endpoint, data = null, token = authToken) => {
  const headers = { Authorization: `Bearer ${token}` };
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

// Helper function to make authenticated API requests with full response
const authRequestWithFullResponse = async (method, endpoint, data = null, token = authToken) => {
  const headers = { Authorization: `Bearer ${token}` };
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
    return response;
  } catch (error) {
    console.error(`Error in ${method.toUpperCase()} request to ${endpoint}:`, 
      error.response?.data || error.message);
    throw error;
  }
};

// Helper function to run a test with proper logging
const runTest = async (name, testFunction) => {
  try {
    console.log(`⏳ Testing: ${name}`);
    await testFunction();
    console.log(`✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.error('   API Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
};

// Health Check - Test service availability
const testHealthCheck = async () => {
  try {
    console.log('\n--- Health Check Tests ---');
    
    // Test root endpoint
    await runTest('API Root Endpoint', async () => {
      const response = await axios.get(`${API_URL.replace('/api', '')}`);
      assert.strictEqual(response.status, 200);
      assert.ok(response.data.message.includes('Welcome'));
    });
    
    return true;
  } catch (error) {
    console.error('Health check tests failed:', error.message);
    return false;
  }
};

// Authentication Tests
const testAuthentication = async () => {
  try {
    console.log('\n--- Authentication Tests ---');
    
    // Test admin login
    await runTest('Admin Login', async () => {
      console.log('Logging in as admin...');
      const response = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
      assert.strictEqual(response.status, 200);
      authToken = response.data.token;
      assert.ok(authToken, 'Token should be present in response');
      
      // Get admin user details
      const userData = await authRequest('get', '/auth/me');
      adminUserId = userData.id;
      assert.ok(adminUserId, 'User ID should be present');
      assert.strictEqual(userData.isAdmin, true, 'User should be an admin');
      
      console.log('Admin login successful');
    });
    
    // Test user registration
    let testUserId;
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    
    await runTest('User Registration', async () => {
      const registrationData = {
        name: 'Test User',
        email: uniqueEmail,
        password: testPassword
      };
      
      const response = await axios.post(`${API_URL}/auth/register`, registrationData);
      assert.strictEqual(response.status, 201);
      assert.ok(response.data.token);
      testUserId = response.data.user.id;
    });
    
    // Test user login
    await runTest('User Login', async () => {
      const loginData = {
        email: uniqueEmail,
        password: testPassword
      };
      
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      assert.strictEqual(response.status, 200);
      assert.ok(response.data.token);
      
      // Get user details with token
      const userToken = response.data.token;
      const userData = await authRequest('get', '/auth/me', null, userToken);
      assert.strictEqual(userData.email, uniqueEmail);
    });
    
    // Test regular user login (for later tests)
    await runTest('Regular User Login', async () => {
      const response = await axios.post(`${API_URL}/auth/login`, USER_CREDENTIALS);
      regularUserToken = response.data.token;
      assert.ok(regularUserToken);
      
      const userData = await authRequest('get', '/auth/me', null, regularUserToken);
      regularUserId = userData.id;
    });
    
    // Test user preferences update
    await runTest('Update User Preferences', async () => {
      const prefData = {
        language: 'fr',
        theme: 'dark'
      };
      
      const response = await authRequestWithFullResponse('put', '/auth/preferences', prefData);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.user.language, 'fr');
      assert.strictEqual(response.data.user.theme, 'dark');
      
      // Reset preferences
      await authRequest('put', '/auth/preferences', { language: 'en', theme: 'light' });
    });
    
    // Test invalid login
    await runTest('Invalid Login Credentials', async () => {
      try {
        await axios.post(`${API_URL}/auth/login`, { 
          email: 'wrong@example.com', 
          password: 'wrongpassword' 
        });
        throw new Error('Login should have failed');
      } catch (error) {
        assert.strictEqual(error.response.status, 400);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Authentication tests failed:', error.message);
    return false;
  }
};

// Get a regular user for operations
const getRegularUser = async () => {
  try {
    console.log('\nGetting a regular user for operations...');
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

// Topic Tests
const testTopics = async () => {
  console.log('\n--- Topic Tests ---');
  
  // Create a test topic
  await runTest('Create Topic', async () => {
    const uniqueName = `Test Topic ${new Date().toISOString()}`;
    const topicData = {
      name: uniqueName,
      description: 'Topic created by api-update-operations-test script'
    };
    
    const result = await authRequest('post', '/topics', topicData);
    // Fix: Check both possible response structures and access the topic data properly
    if (result.topic) {
      testTopicId = result.topic.id;
      testTopicVersion = result.topic.version;
    } else {
      testTopicId = result.id;
      testTopicVersion = result.version;
    }
    testTopicName = uniqueName;
    
    assert.ok(testTopicId, 'Topic ID should be present');
    assert.ok(testTopicVersion !== undefined, 'Topic version should be present');
    assert.strictEqual(testTopicName, uniqueName, 'Topic name should match what was sent');
    
    console.log(`Topic created successfully with ID: ${testTopicId}, version: ${testTopicVersion}`);
  });
  
  // Update the test topic while maintaining the same name
  await runTest('Update Topic (Maintaining Same Name)', async () => {
    const updatedDescription = `Updated description at ${new Date().toISOString()}`;
    const topicData = {
      name: testTopicName, // Same name as before - FIX: this is intentional to maintain the same topic
      description: updatedDescription,
      version: testTopicVersion // Important for optimistic locking
    };
    
    const result = await authRequest('put', `/topics/${testTopicId}`, topicData);
    
    // Handle different response structures
    const updatedTopic = result.topic || result;
    
    // Update stored version for future operations
    testTopicVersion = updatedTopic.version;
    
    // Verify that the ID remains the same (update, not create)
    assert.strictEqual(updatedTopic.id, testTopicId, 'Topic ID should remain the same after update');
    assert.strictEqual(updatedTopic.name, testTopicName, 'Topic name should remain unchanged');
    assert.strictEqual(updatedTopic.description, updatedDescription, 'Description should be updated');
    
    console.log(`Topic updated successfully. Same ID: ${testTopicId}, New version: ${testTopicVersion}`);
    console.log(`Topic name remains: ${updatedTopic.name}, Description updated: ${updatedTopic.description}`);
  });
  
  // Test optimistic locking failure
  await runTest('Optimistic Locking Protection', async () => {
    try {
      // Try to update with an old version number
      const invalidVersion = testTopicVersion - 1;
      const topicData = {
        name: testTopicName,
        description: 'This update should fail',
        version: invalidVersion
      };
      
      await authRequest('put', `/topics/${testTopicId}`, topicData);
      throw new Error('Update should have failed due to version mismatch');
    } catch (error) {
      // Expect a 409 Conflict due to optimistic locking
      assert.strictEqual(error.response.status, 409);
      assert.ok(error.response.data.error === 'OPTIMISTIC_LOCK_ERROR');
    }
  });
  
  // Test unauthorized topic access
  await runTest('Unauthorized Topic Creation (Regular User)', async () => {
    try {
      // Regular user should not be able to create topics
      const topicData = {
        name: `Unauthorized Topic ${Date.now()}`,
        description: 'This should fail'
      };
      
      await authRequest('post', '/topics', topicData, regularUserToken);
      throw new Error('Topic creation should have failed due to lack of admin privileges');
    } catch (error) {
      // Expect a 403 Forbidden due to lack of admin privileges
      assert.strictEqual(error.response.status, 403);
    }
  });
  
  return true;
};

// Template Tests
const testTemplates = async () => {
  console.log('\n--- Template Tests ---');
  
  // Create a test template
  await runTest('Create Template', async () => {
    const uniqueTitle = `Test Template ${new Date().toISOString()}`;
    const templateData = {
      title: uniqueTitle,
      description: 'Template created by api-update-operations-test script',
      isPublic: true,
      topicId: testTopicId,
      customString1State: true,
      customString1Question: 'What is your name?',
      customText1State: true,
      customText1Question: 'Please provide feedback',
      questionOrder: JSON.stringify([
        'customString1',
        'customText1'
      ])
    };
    
    const result = await authRequest('post', '/templates', templateData);
    
    // Handle both possible response structures
    if (result.template) {
      testTemplateId = result.template.id;
      testTemplateVersion = result.template.version;
    } else {
      testTemplateId = result.id;
      testTemplateVersion = result.version;
    }
    testTemplateTitle = uniqueTitle;
    
    assert.ok(testTemplateId, 'Template ID should be present');
    assert.ok(testTemplateVersion !== undefined, 'Template version should be present');
    
    console.log(`Template created successfully with ID: ${testTemplateId} and version: ${testTemplateVersion}`);
  });
  
  // Update the test template while keeping the same title
  await runTest('Update Template (Maintaining Same Title)', async () => {
    // FIX: Keep the same title to ensure we're updating the existing template
    const updatedDesc = `Updated template description ${Date.now()}`;
    const templateData = {
      title: testTemplateTitle, // Keep the same title intentionally
      description: updatedDesc,
      isPublic: true,
      topicId: testTopicId,
      version: testTemplateVersion, // Important for optimistic locking
      customString1State: true,
      customString1Question: 'What is your full name?', // Modified question
      customText1State: true,
      customText1Question: 'Please provide detailed feedback', // Modified question
      customInt1State: true, // Added new field
      customInt1Question: 'Rate our service (1-10)', // Added new field
      questionOrder: JSON.stringify([
        'customString1',
        'customText1',
        'customInt1'
      ])
    };
    
    const result = await authRequest('put', `/templates/${testTemplateId}`, templateData);
    
    // Handle different response structures
    const updatedTemplate = result.template || result;
    
    // Update the version for future operations
    if (result.version) {
      testTemplateVersion = result.version;
    } else if (updatedTemplate.version) {
      testTemplateVersion = updatedTemplate.version;
    }
    
    // Verify result contains the expected data
    assert.ok(updatedTemplate.id === testTemplateId, 'Template ID should remain the same');
    assert.ok(updatedTemplate.title === testTemplateTitle, 'Template title should remain unchanged');
    assert.ok(updatedTemplate.description === updatedDesc, 'Description should be updated');
    
    console.log(`Template updated successfully. Same ID: ${testTemplateId}, New version: ${testTemplateVersion}`);
  });
};

// Form Response Tests
const testFormResponses = async () => {
  console.log('\n--- Form Response Tests ---');
  
  // Create a form response
  await runTest('Create Form Response', async () => {
    const formResponseData = {
      templateId: testTemplateId,
      answers: {
        customString1Answer: 'John Smith',
        customText1Answer: 'Very good service, would recommend.',
        customInt1Answer: 9
      }
    };
    
    const result = await authRequest('post', '/forms', formResponseData);
    testFormResponseId = result.id;
    testFormResponseVersion = result.version;
    
    assert.ok(testFormResponseId);
    assert.strictEqual(result.templateId, testTemplateId);
    assert.strictEqual(result.customString1Answer, 'John Smith');
    assert.strictEqual(result.customText1Answer, 'Very good service, would recommend.');
    assert.strictEqual(result.customInt1Answer, 9);
    
    console.log(`Form response created successfully with ID: ${testFormResponseId}`);
  });
  
  // Get responses by template
  await runTest('Get Form Responses by Template', async () => {
    const responses = await authRequest('get', `/forms/template/${testTemplateId}`);
    
    assert.ok(Array.isArray(responses));
    const createdResponse = responses.find(r => r.id === testFormResponseId);
    assert.ok(createdResponse, 'Should find the created form response');
  });
  
  // Get response by ID
  await runTest('Get Form Response by ID', async () => {
    const response = await authRequest('get', `/forms/${testFormResponseId}`);
    
    assert.strictEqual(response.id, testFormResponseId);
    assert.strictEqual(response.customString1Answer, 'John Smith');
  });
  
  // Get aggregate data
  await runTest('Get Aggregate Form Data', async () => {
    const aggregateData = await authRequest('get', `/forms/template/${testTemplateId}/aggregate`);
    
    assert.ok(typeof aggregateData === 'object');
    assert.ok('total_responses' in aggregateData);
    assert.ok(aggregateData.total_responses >= 1);
  });
  
  return true;
};

// Comment Tests
const testComments = async () => {
  console.log('\n--- Comment Tests ---');
  
  // Create a comment
  await runTest('Create Comment', async () => {
    const commentData = {
      templateId: testTemplateId,
      content: `Test comment created at ${new Date().toISOString()}`
    };
    
    const result = await authRequest('post', '/comments', commentData);
    testCommentId = result.id;
    testCommentVersion = result.version;
    
    assert.ok(testCommentId);
    assert.strictEqual(result.templateId, testTemplateId);
    assert.ok(result.content.includes('Test comment'));
    
    console.log(`Comment created successfully with ID: ${testCommentId}`);
  });
  
  // Get comments by template
  await runTest('Get Comments by Template', async () => {
    const comments = await authRequest('get', `/comments/template/${testTemplateId}`);
    
    assert.ok(Array.isArray(comments));
    const createdComment = comments.find(c => c.id === testCommentId);
    assert.ok(createdComment, 'Should find the created comment');
  });
  
  // Delete comment
  await runTest('Delete Comment', async () => {
    const deleteData = { version: testCommentVersion };
    await authRequest('delete', `/comments/${testCommentId}`, deleteData);
    
    // Verify it's deleted by checking if it's no longer in the list
    const commentsAfter = await authRequest('get', `/comments/template/${testTemplateId}`);
    const shouldBeDeleted = commentsAfter.find(c => c.id === testCommentId);
    assert.strictEqual(shouldBeDeleted, undefined, 'Comment should be deleted');
  });
  
  return true;
};

// Like Tests
const testLikes = async () => {
  console.log('\n--- Like Tests ---');
  
  // Add a like
  await runTest('Add Like', async () => {
    const result = await authRequest('post', `/likes/template/${testTemplateId}`);
    
    assert.strictEqual(result.liked, true);
    console.log(`Template liked successfully`);
  });
  
  // Check like status
  await runTest('Check Like Status', async () => {
    const result = await authRequest('get', `/likes/check/${testTemplateId}`);
    
    assert.strictEqual(result.liked, true, 'Template should be liked');
  });
  
  // Count likes
  await runTest('Count Likes', async () => {
    const result = await authRequest('get', `/likes/count/${testTemplateId}`);
    
    assert.ok(result.count >= 1, 'Like count should be at least 1');
  });
  
  // Get likes by template
  await runTest('Get Likes by Template', async () => {
    const result = await authRequest('get', `/likes/template/${testTemplateId}`);
    
    assert.strictEqual(result.templateId, testTemplateId);
    assert.ok(Array.isArray(result.likes));
    assert.ok(result.likesCount >= 1, 'Like count should be at least 1');
  });
  
  // Remove like
  await runTest('Remove Like', async () => {
    const result = await authRequest('delete', `/likes/template/${testTemplateId}`);
    
    assert.strictEqual(result.liked, false);
    console.log(`Template unliked successfully`);
  });
  
  // Verify like is removed
  await runTest('Verify Like Removal', async () => {
    const result = await authRequest('get', `/likes/check/${testTemplateId}`);
    
    assert.strictEqual(result.liked, false, 'Template should be unliked');
  });
  
  return true;
};

// User Admin Tests
const testUserAdmin = async () => {
  console.log('\n--- User Admin Tests ---');
  
  let testUserId;
  
  // Create a test user for admin operations
  await runTest('Create Test User', async () => {
    const uniqueEmail = `admin.test.${Date.now()}@example.com`;
    const userData = {
      name: 'Admin Test User',
      email: uniqueEmail,
      password: testPassword
    };
    
    const result = await axios.post(`${API_URL}/auth/register`, userData);
    testUserId = result.data.user.id;
    
    assert.ok(testUserId);
    console.log(`Test user created with ID: ${testUserId}`);
  });
  
  // Test toggling user block status
  await runTest('Toggle User Block Status', async () => {
    // Block the user
    let result = await authRequest('put', `/users/${testUserId}/block`);
    
    assert.strictEqual(result.user.blocked, true, 'User should be blocked');
    
    // Unblock the user
    result = await authRequest('put', `/users/${testUserId}/block`);
    
    assert.strictEqual(result.user.blocked, false, 'User should be unblocked');
  });
  
  // Test toggling admin status
  await runTest('Toggle User Admin Status', async () => {
    // Make user an admin
    let result = await authRequest('put', `/users/${testUserId}/admin`);
    
    assert.strictEqual(result.user.isAdmin, true, 'User should be an admin');
    
    // Remove admin privileges
    result = await authRequest('put', `/users/${testUserId}/admin`);
    
    assert.strictEqual(result.user.isAdmin, false, 'User should not be an admin');
  });
  
  // Test prevention of self-modification (should fail)
  await runTest('Prevent Self-Modification', async () => {
    try {
      await authRequest('put', `/users/${adminUserId}/block`);
      throw new Error('Self-blocking should fail');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
    }
    
    try {
      await authRequest('put', `/users/${adminUserId}/admin`);
      throw new Error('Self-admin toggling should fail');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
    }
  });
  
  return true;
};

// Clean up resources
const cleanupResources = async () => {
  console.log('\n--- Cleaning Up Resources ---');
  
  // Delete the test template
  await runTest('Delete Template', async () => {
    // Ensure we have a valid version number
    if (testTemplateVersion === undefined || testTemplateVersion === null) {
      console.log('WARNING: Template version is undefined, cannot delete template');
      return;
    }
    
    const deleteData = { version: testTemplateVersion };
    await authRequest('delete', `/templates/${testTemplateId}`, deleteData);
    console.log('Template deleted successfully');
  });
  
  // Delete the test topic
  await runTest('Delete Topic', async () => {
    // Ensure we have a valid version number
    if (testTopicVersion === undefined || testTopicVersion === null) {
      console.log('WARNING: Topic version is undefined, cannot delete topic');
      return;
    }
    
    const deleteData = { version: testTopicVersion };
    await authRequest('delete', `/topics/${testTopicId}`, deleteData);
    console.log('Topic deleted successfully');
  });
  
  return true;
};

// Run all tests
const runTests = async () => {
  console.log('Starting API Operations Tests...');
  
  // Health check
  await testHealthCheck();
  
  // Authentication tests
  await testAuthentication();
  
  // Get a regular user for operations
  if (!await getRegularUser()) {
    console.error('Failed to get a regular user. Aborting tests.');
    return;
  }
  
  // Topic tests (including fix for updates)
  await testTopics();
  
  // Template tests (including fix for updates)
  await testTemplates();
  
  // Form Response tests
  await testFormResponses();
  
  // Comment tests
  await testComments();
  
  // Like tests
  await testLikes();
  
  // User Admin tests
  await testUserAdmin();
  
  // Clean up resources
  await cleanupResources();
  
  console.log('\nAll API operations tests completed!');
};

// Run the tests
runTests().catch(error => {
  console.error('Test failed: ', error.message);
  process.exit(1);
});