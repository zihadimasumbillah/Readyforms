const axios = require('axios');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: '../.env' });

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const TEST_TIMEOUT = 10000; // 10 seconds timeout for tests

// Test credentials
const adminCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

const userCredentials = {
  email: 'user@example.com',
  password: 'user123'
};

// Test data for registration
const testUserEmail = `test-user-${uuidv4().substring(0, 8)}@example.com`;
const testUserPassword = 'test123';

// Store tokens for authenticated requests
let adminToken = null;
let userToken = null;
let testUserToken = null;
let testTemplateId = null;
let testTagNames = ['test-tag-1', 'test-tag-2'];
let testTagIds = [];
let testFormResponseId = null;
let testCommentId = null;

// Helper to check if server is up
async function checkServerStatus() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    return false;
  }
}

// Helper to authenticate users
async function authenticate(credentials) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data && response.data.token) {
      return response.data.token;
    }
  } catch (error) {
    console.error(`Authentication failed for ${credentials.email}:`, 
      error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('=== ReadyForms API Test Suite ===');
  console.log(`Testing API at: ${API_URL}\n`);
  
  // Check if server is up
  console.log('1. Checking server status...');
  const isServerUp = await checkServerStatus();
  if (!isServerUp) {
    console.error('❌ Server is not responding. Make sure the backend is running.');
    return;
  }
  console.log('✅ Server is up and running\n');

  // Test user registration
  console.log('\n2. Testing user registration...');
  try {
    const registrationData = {
      name: 'Test User',
      email: testUserEmail,
      password: testUserPassword
    };
    
    const response = await axios.post(`${API_URL}/auth/register`, registrationData);
    
    if (response.data && response.data.token && response.data.user) {
      console.log('✅ User registration successful');
      console.log(`   - User created with email: ${response.data.user.email}`);
      testUserToken = response.data.token;
      
      // Test newly registered user profile retrieval
      try {
        const profileResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${testUserToken}`
          }
        });
        
        if (profileResponse.data && profileResponse.data.email === testUserEmail) {
          console.log('✅ Newly registered user profile retrieved successfully');
        } else {
          console.error('❌ Newly registered user profile data doesn\'t match expected value');
        }
      } catch (error) {
        console.error('❌ Failed to retrieve newly registered user profile:', 
          error.response?.data || error.message);
      }
    } else {
      console.error('❌ User registration failed');
    }
  } catch (error) {
    console.error('❌ Failed to register user:', error.response?.data || error.message);
    
    // Test duplicate registration (should fail)
    try {
      const registrationData = {
        name: 'Test User',
        email: userCredentials.email, // Use existing email to test duplicate registration
        password: testUserPassword
      };
      
      await axios.post(`${API_URL}/auth/register`, registrationData);
      console.error('❌ Duplicate user registration did not fail as expected');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Duplicate user registration was properly rejected');
      } else {
        console.error('❌ Unexpected error during duplicate registration test:', 
          error.response?.data || error.message);
      }
    }
  }

  // Test authentication
  console.log('\n3. Testing authentication...');
  
  // Admin login
  adminToken = await authenticate(adminCredentials);
  if (!adminToken) {
    console.error('❌ Admin authentication failed');
    return;
  }
  console.log('✅ Admin login successful');
  
  // User login
  userToken = await authenticate(userCredentials);
  if (!userToken) {
    console.error('❌ User authentication failed');
    return;
  }
  console.log('✅ User login successful\n');

  // Test current user endpoint
  console.log('4. Testing user profile retrieval...');
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.data && response.data.email === adminCredentials.email) {
      console.log('✅ User profile retrieved successfully');
    } else {
      console.error('❌ User profile data doesn\'t match expected value');
    }
  } catch (error) {
    console.error('❌ Failed to retrieve user profile:', 
      error.response?.data || error.message);
  }
  
  // Continue with the rest of the tests...
  console.log('\n=== Test Suite Completed ===');
}

// Run the tests with timeout
console.log('Starting API tests...');
runTests().catch(error => {
  console.error('Test suite error:', error);
});