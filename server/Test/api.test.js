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

  // Test topics API
  console.log('\n5. Testing topics API...');
  let topicId;
  try {
    const response = await axios.get(`${API_URL}/topics`);
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log(`✅ Topics retrieved successfully (${response.data.length} topics)`);
      topicId = response.data[0].id;
    } else {
      console.error('❌ Topics response is empty or not an array');
    }
  } catch (error) {
    console.error('❌ Failed to retrieve topics:', 
      error.response?.data || error.message);
  }

  // Test templates API
  console.log('\n6. Testing templates API...');
  try {
    const response = await axios.get(`${API_URL}/templates`);
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Templates retrieved successfully (${response.data.length} templates)`);
      
      // Store a template ID for further testing
      if (response.data.length > 0) {
        testTemplateId = response.data[0].id;
        
        // Test single template retrieval
        try {
          const templateResponse = await axios.get(`${API_URL}/templates/${testTemplateId}`);
          if (templateResponse.data && templateResponse.data.id === testTemplateId) {
            console.log('✅ Single template retrieved successfully');
          } else {
            console.error('❌ Single template response does not match expected template');
          }
        } catch (error) {
          console.error('❌ Failed to retrieve single template:', 
            error.response?.data || error.message);
        }
      }
    } else {
      console.error('❌ Templates response is not an array');
    }
  } catch (error) {
    console.error('❌ Failed to retrieve templates:', 
      error.response?.data || error.message);
  }
  
  // Test Form Response CRUD operations
  console.log('\n6.1 Testing Form Response CRUD operations...');
  if (testTemplateId && userToken) {
    // Create form response
    try {
      const responseData = {
        templateId: testTemplateId,
        answers: {
          customString1Answer: 'Test answer',
          customInt1Answer: 42,
          customCheckbox1Answer: true
        }
      };
      
      const response = await axios.post(
        `${API_URL}/form-responses`, 
        responseData, 
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      
      if (response.data && response.data.id) {
        console.log('✅ Form response created successfully');
        testFormResponseId = response.data.id;
        
        // Test get form response by ID
        try {
          const getResponse = await axios.get(
            `${API_URL}/form-responses/${testFormResponseId}`,
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
          
          if (getResponse.data && getResponse.data.id === testFormResponseId) {
            console.log('✅ Form response retrieved by ID successfully');
          } else {
            console.error('❌ Failed to retrieve form response by ID');
          }
        } catch (error) {
          console.error('❌ Failed to retrieve form response by ID:', 
            error.response?.data || error.message);
        }
        
        // Test get form responses by template
        try {
          const getByTemplateResponse = await axios.get(
            `${API_URL}/form-responses/template/${testTemplateId}`,
            {
              headers: {
                'Authorization': `Bearer ${adminToken}` // Use admin token to test permissions
              }
            }
          );
          
          if (getByTemplateResponse.data && Array.isArray(getByTemplateResponse.data)) {
            console.log('✅ Form responses retrieved by template successfully');
            
            // Test if our response is in the results
            const foundResponse = getByTemplateResponse.data.some(
              item => item.id === testFormResponseId
            );
            
            if (foundResponse) {
              console.log('✅ Newly created form response found in template responses');
            } else {
              console.error('❌ Newly created form response not found in template responses');
            }
          } else {
            console.error('❌ Form responses by template response is not an array');
          }
        } catch (error) {
          console.error('❌ Failed to retrieve form responses by template:', 
            error.response?.data || error.message);
        }
        
        // Test get form responses by user
        try {
          const getByUserResponse = await axios.get(
            `${API_URL}/form-responses/user`,
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
          
          if (getByUserResponse.data && Array.isArray(getByUserResponse.data)) {
            console.log('✅ Form responses retrieved by user successfully');
            
            // Test if our response is in the results
            const foundResponse = getByUserResponse.data.some(
              item => item.id === testFormResponseId
            );
            
            if (foundResponse) {
              console.log('✅ Newly created form response found in user responses');
            } else {
              console.error('❌ Newly created form response not found in user responses');
            }
          } else {
            console.error('❌ Form responses by user response is not an array');
          }
        } catch (error) {
          console.error('❌ Failed to retrieve form responses by user:', 
            error.response?.data || error.message);
        }
        
        // Test aggregate data endpoint
        try {
          const aggregateResponse = await axios.get(
            `${API_URL}/form-responses/aggregate/${testTemplateId}`,
            {
              headers: {
                'Authorization': `Bearer ${adminToken}`
              }
            }
          );
          
          if (aggregateResponse.data) {
            console.log('✅ Form response aggregate data retrieved successfully');
          } else {
            console.error('❌ Failed to retrieve form response aggregate data');
          }
        } catch (error) {
          console.error('❌ Failed to retrieve form response aggregate data:', 
            error.response?.data || error.message);
        }
        
        // No update test since form responses can't be updated
        // No delete test to avoid affecting data
        
      } else {
        console.error('❌ Failed to create form response');
      }
    } catch (error) {
      console.error('❌ Failed to create form response:', 
        error.response?.data || error.message);
    }
  } else {
    console.error('❌ Cannot test form responses: Test template ID or user token not available');
  }
  
  // Test Comments CRUD operations
  console.log('\n6.2 Testing Comments CRUD operations...');
  if (testTemplateId && userToken) {
    // Create comment
    try {
      const commentData = {
        templateId: testTemplateId,
        content: 'This is a test comment from API tests'
      };
      
      const response = await axios.post(
        `${API_URL}/comments`, 
        commentData, 
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      
      if (response.data && response.data.id) {
        testCommentId = response.data.id;
        console.log('✅ Comment created successfully');
        
        // Get comments by template
        try {
          const commentsResponse = await axios.get(
            `${API_URL}/comments/template/${testTemplateId}`
          );
          
          if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
            console.log('✅ Comments retrieved by template successfully');
            
            // Test if our comment is in the results
            const foundComment = commentsResponse.data.some(
              comment => comment.id === testCommentId
            );
            
            if (foundComment) {
              console.log('✅ Newly created comment found in template comments');
            } else {
              console.error('❌ Newly created comment not found in template comments');
            }
          } else {
            console.error('❌ Comments by template response is not an array');
          }
        } catch (error) {
          console.error('❌ Failed to retrieve comments by template:', 
            error.response?.data || error.message);
        }
        
        // Get comment version for delete operation
        let commentVersion;
        try {
          const commentsResponse = await axios.get(`${API_URL}/comments/template/${testTemplateId}`);
          commentsResponse.data.forEach(comment => {
            if (comment.id === testCommentId) {
              commentVersion = comment.version;
            }
          });
        } catch (error) {
          console.error('❌ Failed to get comment version:', 
            error.response?.data || error.message);
        }
        
        // Delete comment
        if (commentVersion !== undefined) {
          try {
            const deleteResponse = await axios.delete(
              `${API_URL}/comments/${testCommentId}`,
              {
                headers: {
                  'Authorization': `Bearer ${userToken}`
                },
                data: { version: commentVersion }
              }
            );
            
            if (deleteResponse.status === 200) {
              console.log('✅ Comment deleted successfully');
              
              // Verify comment was deleted
              try {
                const verifyResponse = await axios.get(
                  `${API_URL}/comments/template/${testTemplateId}`
                );
                
                if (verifyResponse.data && Array.isArray(verifyResponse.data)) {
                  const commentExists = verifyResponse.data.some(
                    comment => comment.id === testCommentId
                  );
                  
                  if (!commentExists) {
                    console.log('✅ Comment deletion verified');
                  } else {
                    console.error('❌ Comment still exists after deletion');
                  }
                }
              } catch (error) {
                console.error('❌ Failed to verify comment deletion:', 
                  error.response?.data || error.message);
              }
            } else {
              console.error('❌ Failed to delete comment');
            }
          } catch (error) {
            console.error('❌ Failed to delete comment:', 
              error.response?.data || error.message);
          }
        } else {
          console.error('❌ Comment version not found for deletion test');
        }
      } else {
        console.error('❌ Failed to create comment');
      }
    } catch (error) {
      console.error('❌ Failed to create comment:', 
        error.response?.data || error.message);
    }
  } else {
    console.error('❌ Cannot test comments: Test template ID or user token not available');
  }

  // Test likes functionality
  console.log('\n6.3 Testing Likes functionality...');
  if (testTemplateId && userToken) {
    // Toggle like (add like)
    try {
      const response = await axios.post(
        `${API_URL}/likes/template/${testTemplateId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        }
      );
      
      if (response.data && response.data.liked === true) {
        console.log('✅ Template liked successfully');
        
        // Check like status
        try {
          const checkResponse = await axios.get(
            `${API_URL}/likes/check/${testTemplateId}`,
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
          
          if (checkResponse.data && checkResponse.data.liked === true) {
            console.log('✅ Like status check successful');
          } else {
            console.error('❌ Like status check failed');
          }
        } catch (error) {
          console.error('❌ Failed to check like status:', 
            error.response?.data || error.message);
        }
        
        // Count likes
        try {
          const countResponse = await axios.get(
            `${API_URL}/likes/count/${testTemplateId}`
          );
          
          if (countResponse.data && typeof countResponse.data.count === 'number') {
            console.log(`✅ Like count successful (${countResponse.data.count} likes)`);
          } else {
            console.error('❌ Like count failed');
          }
        } catch (error) {
          console.error('❌ Failed to count likes:', 
            error.response?.data || error.message);
        }
        
        // Get likes by template
        try {
          const likesResponse = await axios.get(
            `${API_URL}/likes/template/${testTemplateId}`
          );
          
          if (likesResponse.data && likesResponse.data.likes) {
            console.log(`✅ Likes by template retrieved successfully (${likesResponse.data.likesCount} likes)`);
          } else {
            console.error('❌ Likes by template retrieval failed');
          }
        } catch (error) {
          console.error('❌ Failed to retrieve likes by template:', 
            error.response?.data || error.message);
        }
        
        // Toggle like again (unlike)
        try {
          const unlikeResponse = await axios.post(
            `${API_URL}/likes/template/${testTemplateId}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
          
          if (unlikeResponse.data && unlikeResponse.data.liked === false) {
            console.log('✅ Template unliked successfully');
            
            // Verify unlike
            try {
              const verifyResponse = await axios.get(
                `${API_URL}/likes/check/${testTemplateId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${userToken}`
                  }
                }
              );
              
              if (verifyResponse.data && verifyResponse.data.liked === false) {
                console.log('✅ Unlike verified');
              } else {
                console.error('❌ Unlike verification failed');
              }
            } catch (error) {
              console.error('❌ Failed to verify unlike:', 
                error.response?.data || error.message);
            }
          } else {
            console.error('❌ Template unlike failed');
          }
        } catch (error) {
          console.error('❌ Failed to unlike template:', 
            error.response?.data || error.message);
        }
      } else {
        console.error('❌ Template like failed');
      }
    } catch (error) {
      console.error('❌ Failed to test likes functionality:', 
        error.response?.data || error.message);
    }
  } else {
    console.error('❌ Cannot test likes: Test template ID or user token not available');
  }
  
  // Test tags API
  console.log('\n7. Testing tags API...');
  
  // 7.1 Get all tags
  try {
    const response = await axios.get(`${API_URL}/tags`);
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Tags retrieved successfully (${response.data.length} tags)`);
      
      // Store existing tags for later use
      if (response.data.length > 0) {
        testTagIds = response.data.map(tag => tag.id);
      }
    } else {
      console.error('❌ Tags response is not an array');
    }
  } catch (error) {
    console.error('❌ Failed to retrieve tags:', 
      error.response?.data || error.message);
  }
  
  // 7.2 Get popular tags
  try {
    const response = await axios.get(`${API_URL}/tags/popular?limit=5`);
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Popular tags retrieved successfully (${response.data.length} tags)`);
    } else {
      console.error('❌ Popular tags response is not an array');
    }
  } catch (error) {
    console.error('❌ Failed to retrieve popular tags:', 
      error.response?.data || error.message);
  }

  // Test tag functionality with templates
  console.log('\n8. Testing templates with tags functionality...');
  if (adminToken && topicId) {
    // 8.1 Create a test template with tags
    try {
      const templateData = {
        title: 'Tag Test Template',
        description: 'This is a test template for testing tag functionality',
        isPublic: true,
        topicId: topicId,
        customString1State: true,
        customString1Question: 'Test Question',
        tags: testTagNames
      };
      
      const response = await axios.post(`${API_URL}/templates`, templateData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (response.data && response.data.id) {
        testTemplateId = response.data.id;
        console.log('✅ Template with tags created successfully');
        
        // Verify tags were added to the template
        if (response.data.tags && Array.isArray(response.data.tags)) {
          const tagNames = response.data.tags.map(tag => tag.name);
          const allTagsPresent = testTagNames.every(tagName => 
            tagNames.includes(tagName)
          );
          
          if (allTagsPresent) {
            console.log('✅ All tags were successfully added to the template');
            
            // Save the tag IDs for later tests
            testTagIds = response.data.tags.map(tag => tag.id);
          } else {
            console.error('❌ Not all tags were added to the template');
          }
        } else {
          console.error('❌ Tags not returned in template creation response');
        }
        
        // 8.2 Test updating template tags
        try {
          const updatedTagNames = ['updated-tag-1', 'updated-tag-2', 'updated-tag-3'];
          const updateResponse = await axios.put(
            `${API_URL}/templates/${testTemplateId}`,
            {
              title: 'Updated Tag Test Template',
              description: 'Updated description',
              topicId: topicId,
              version: response.data.version,
              customString1State: true,
              customString1Question: 'Updated Test Question',
              tags: updatedTagNames
            },
            {
              headers: {
                'Authorization': `Bearer ${adminToken}`
              }
            }
          );
          
          if (updateResponse.data && updateResponse.data.template) {
            console.log('✅ Template updated successfully');
            
            // Verify tags were updated
            if (updateResponse.data.template.tags && Array.isArray(updateResponse.data.template.tags)) {
              const tagNames = updateResponse.data.template.tags.map(tag => tag.name);
              const allTagsPresent = updatedTagNames.every(tagName => 
                tagNames.includes(tagName)
              );
              
              if (allTagsPresent) {
                console.log('✅ All tags were successfully updated on the template');
              } else {
                console.error('❌ Not all tags were updated on the template');
              }
            } else {
              console.error('❌ Tags not returned in template update response');
            }
          } else {
            console.error('❌ Template update failed');
          }
          
          // 8.3 Test filtering templates by tag
          if (updateResponse && updateResponse.data && updateResponse.data.template.tags) {
            const firstTagName = updateResponse.data.template.tags[0].name;
            
            try {
              const tagFilterResponse = await axios.get(`${API_URL}/templates?tag=${firstTagName}`);
              
              if (tagFilterResponse.data && Array.isArray(tagFilterResponse.data)) {
                const filteredTemplates = tagFilterResponse.data;
                const foundTestTemplate = filteredTemplates.some(template => template.id === testTemplateId);
                
                if (foundTestTemplate) {
                  console.log('✅ Successfully filtered templates by tag');
                } else {
                  console.error('❌ Failed to filter templates by tag (test template not found)');
                }
              } else {
                console.error('❌ Tag filtering response is not an array');
              }
            } catch (error) {
              console.error('❌ Failed to filter templates by tag:', 
                error.response?.data || error.message);
            }
          }
        } catch (error) {
          console.error('❌ Failed to update template tags:', 
            error.response?.data || error.message);
        }
      } else {
        console.error('❌ Failed to create template with tags');
      }
    } catch (error) {
      console.error('❌ Failed to test tags functionality:', 
        error.response?.data || error.message);
    }
  } else {
    console.error('❌ Cannot test tags: Admin authentication or valid topic ID required');
  }

  // Test tags CRUD operations
  console.log('\n9. Testing tag CRUD operations...');
  
  // 9.1 Test creating a new tag (admin only)
  let newTagId = null;
  if (adminToken) {
    try {
      const response = await axios.post(
        `${API_URL}/tags`, 
        { name: 'api-test-tag' }, 
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );
      
      if (response.data && response.data.tag && response.data.tag.id) {
        newTagId = response.data.tag.id;
        console.log('✅ Tag created successfully');
      } else {
        console.error('❌ Failed to create new tag');
      }
    } catch (error) {
      console.error('❌ Failed to create new tag:', 
        error.response?.data || error.message);
    }
    
    // 9.2 Test adding tag to template
    if (newTagId && testTemplateId) {
      try {
        const response = await axios.post(
          `${API_URL}/tags/template`, 
          { 
            tagId: newTagId,
            templateId: testTemplateId
          }, 
          {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          }
        );
        
        if (response.status === 201) {
          console.log('✅ Tag added to template successfully');
        } else {
          console.error('❌ Failed to add tag to template');
        }
      } catch (error) {
        console.error('❌ Failed to add tag to template:', 
          error.response?.data || error.message);
      }
      
      // 9.3 Test removing tag from template
      try {
        const response = await axios.delete(
          `${API_URL}/tags/template`, 
          { 
            headers: {
              'Authorization': `Bearer ${adminToken}`
            },
            data: {
              tagId: newTagId,
              templateId: testTemplateId
            }
          }
        );
        
        if (response.status === 200) {
          console.log('✅ Tag removed from template successfully');
        } else {
          console.error('❌ Failed to remove tag from template');
        }
      } catch (error) {
        console.error('❌ Failed to remove tag from template:', 
          error.response?.data || error.message);
      }
      
      // 9.4 Test deleting tag (admin only)
      try {
        const response = await axios.delete(
          `${API_URL}/tags/${newTagId}`, 
          {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          }
        );
        
        if (response.status === 200) {
          console.log('✅ Tag deleted successfully');
        } else {
          console.error('❌ Failed to delete tag');
        }
      } catch (error) {
        console.error('❌ Failed to delete tag:', 
          error.response?.data || error.message);
      }
    }
  }

  // Test admin endpoints with admin token
  console.log('\n10. Testing admin endpoints with admin token...');
  if (adminToken) {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.data) {
        console.log('✅ Admin stats retrieved successfully');
      } else {
        console.error('❌ Admin stats retrieval failed');
      }
    } catch (error) {
      console.error('❌ Failed to retrieve admin stats:', 
        error.response?.data || error.message);
    }

    // Test users list (admin only)
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Users list retrieved successfully (${response.data.length} users)`);
      } else {
        console.error('❌ Users list response is not an array');
      }
    } catch (error) {
      console.error('❌ Failed to retrieve users list:', 
        error.response?.data || error.message);
    }
  }

  // Test non-admin access to admin endpoints
  console.log('\n11. Testing admin endpoints with non-admin token (should fail)...');
  if (userToken) {
    try {
      await axios.get(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      console.error('❌ Non-admin was able to access admin endpoint (security issue!)');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('✅ Admin endpoint properly rejected non-admin access');
      } else {
        console.error('❌ Unexpected error when testing admin access:', 
          error.response?.data || error.message);
      }
    }
  }

  // Test searching templates
  console.log('\n12. Testing template search functionality...');
  try {
    const response = await axios.get(`${API_URL}/templates?query=test`);
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Template search successful (found ${response.data.length} results)`);
    } else {
      console.error('❌ Template search response is not an array');
    }
  } catch (error) {
    console.error('❌ Failed to search templates:', 
      error.response?.data || error.message);
  }

  // Test pagination and filtering options
  console.log('\n12.1 Testing pagination and filtering options...');
  try {
    // Test templates with pagination
    const paginatedResponse = await axios.get(`${API_URL}/templates?limit=2&page=1`);
    
    if (paginatedResponse.data && Array.isArray(paginatedResponse.data) && 
        paginatedResponse.data.length <= 2) {
      console.log('✅ Template pagination works correctly');
    } else {
      console.error('❌ Template pagination failed or returned incorrect number of items');
    }
    
    // Test sorting by creation date (newest first - default)
    const sortedDefaultResponse = await axios.get(`${API_URL}/templates`);
    
    // Test sorting by creation date (oldest first)
    const sortedAscResponse = await axios.get(`${API_URL}/templates?sort=oldest`);
    
    if (sortedDefaultResponse.data && sortedAscResponse.data && 
        sortedDefaultResponse.data.length > 1 && sortedAscResponse.data.length > 1) {
      
      // Check if the orders are different (if there are multiple items)
      const defaultFirstId = sortedDefaultResponse.data[0].id;
      const ascFirstId = sortedAscResponse.data[0].id;
      
      if (defaultFirstId !== ascFirstId) {
        console.log('✅ Template sorting works correctly');
      } else {
        console.log('ℹ️ Could not verify sort order (possibly only one template or same timestamps)');
      }
    } else {
      console.log('ℹ️ Not enough templates to test sorting');
    }
  } catch (error) {
    console.error('❌ Failed to test pagination and sorting:', 
      error.response?.data || error.message);
  }
  
  // Test error handling for invalid inputs
  console.log('\n12.2 Testing error handling for invalid inputs...');
  
  // Test invalid UUID format
  try {
    await axios.get(`${API_URL}/templates/invalid-uuid-format`);
    console.error('❌ Invalid UUID did not cause an error as expected');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Invalid UUID format was properly rejected with 400 status');
    } else {
      console.error('❌ Invalid UUID test did not return expected status code:', 
        error.response?.status || error);
    }
  }
  
  // Test non-existent resource
  try {
    const nonExistentUuid = '00000000-0000-4000-a000-000000000000';
    await axios.get(`${API_URL}/templates/${nonExistentUuid}`);
    console.error('❌ Non-existent UUID did not cause an error as expected');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Non-existent resource was properly rejected with 404 status');
    } else {
      console.error('❌ Non-existent resource test did not return expected status code:', 
        error.response?.status || error);
    }
  }
  
  // Test unauthorized access
  try {
    // Try to access a protected route without authorization
    await axios.get(`${API_URL}/auth/me`);
    console.error('❌ Unauthorized access did not cause an error as expected');
  } catch (error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('✅ Unauthorized access was properly rejected with 401/403 status');
    } else {
      console.error('❌ Unauthorized access test did not return expected status code:', 
        error.response?.status || error);
    }
  }
  
  // Test various query parameters
  console.log('\n12.3 Testing various query parameters...');
  try {
    // Test templates with query params for tags (already tested in tag section)
    console.log('✓ Tag filtering already tested in tag functionality section');
    
    // Test templates with query params for topics
    if (topicId) {
      const topicFilterResponse = await axios.get(`${API_URL}/templates?topicId=${topicId}`);
      
      if (topicFilterResponse.data && Array.isArray(topicFilterResponse.data)) {
        console.log(`✅ Topic filtering successful (found ${topicFilterResponse.data.length} results)`);
        
        // Check if all returned templates match the topic
        const allMatchTopic = topicFilterResponse.data.every(template => template.topicId === topicId);
        
        if (allMatchTopic) {
          console.log('✅ All returned templates match the requested topic');
        } else {
          console.error('❌ Some templates do not match the requested topic');
        }
      } else {
        console.error('❌ Topic filtering response is not an array');
      }
    } else {
      console.log('ℹ️ Skipping topic filtering test (no topic ID available)');
    }
    
    // Test combined filters (query + tag)
    if (testTemplateId) {
      // Get a tag from the recently created test template
      const testTemplateResponse = await axios.get(`${API_URL}/templates/${testTemplateId}`);
      
      if (testTemplateResponse.data && testTemplateResponse.data.tags && 
          testTemplateResponse.data.tags.length > 0) {
        
        const tagName = testTemplateResponse.data.tags[0].name;
        const combinedResponse = await axios.get(
          `${API_URL}/templates?query=test&tag=${tagName}`
        );
        
        if (combinedResponse.data && Array.isArray(combinedResponse.data)) {
          console.log(`✅ Combined filtering successful (found ${combinedResponse.data.length} results)`);
        } else {
          console.error('❌ Combined filtering response is not an array');
        }
      } else {
        console.log('ℹ️ Skipping combined filtering test (no tags on test template)');
      }
    } else {
      console.log('ℹ️ Skipping combined filtering test (no test template ID available)');
    }
  } catch (error) {
    console.error('❌ Failed to test query parameters:', 
      error.response?.data || error.message);
  }

  // Clean up test template if created
  if (testTemplateId && adminToken) {
    console.log('\n13. Cleaning up test data...');
    try {
      // Get template to get the version
      const templateResponse = await axios.get(`${API_URL}/templates/${testTemplateId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (templateResponse.data && templateResponse.data.version !== undefined) {
        const version = templateResponse.data.version;
        
        await axios.delete(`${API_URL}/templates/${testTemplateId}`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          data: { version }
        });
        console.log('✅ Test template deleted successfully');
      }
    } catch (error) {
      console.error('❌ Failed to clean up test template:', 
        error.response?.data || error.message);
    }
  }

  // Database connection test
  console.log('\n14. Testing database connection...');
  try {
    const response = await axios.get(`${API_URL}/health/system`);
    if (response.data && response.data.database && response.data.database.connected) {
      console.log('✅ Database connection test successful');
    } else {
      console.error('❌ Database connection test failed');
    }
  } catch (error) {
    console.error('❌ Failed to test database connection:', 
      error.response?.data || error.message);
  }

  console.log('\n=== Test Suite Completed ===');
}

// Run the tests with timeout
console.log('Starting API tests...');
runTests().catch(error => {
  console.error('Test suite error:', error);
});