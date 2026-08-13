const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const HEALTH_URL = 'http://localhost:3001/health';

const results = [];

function recordPass(name, details) {
  console.log(`✅ [PASS] ${name}${details ? ` - ${details}` : ''}`);
  results.push({ name, passed: true, details });
}

function recordFail(name, error) {
  const message = error.response?.data?.message || error.message || String(error);
  console.error(`❌ [FAIL] ${name} - ${message}`);
  results.push({ name, passed: false, details: message });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Comprehensive API & Functionality Test Suite');
  console.log('====================================================\n');

  let adminToken = '';
  let userToken = '';
  let adminId = '';
  let userId = '';
  let createdTopicId = '';
  let createdTemplateId = '';
  let createdResponseId = '';

  // 1. Health Check
  try {
    const res = await axios.get(HEALTH_URL);
    if (res.status === 200 && res.data.status === 'ok') {
      recordPass('Health Check', `Status: ${res.data.status}`);
    } else {
      recordFail('Health Check', new Error('Status not ok'));
    }
  } catch (err) {
    recordFail('Health Check', err);
  }

  // 2. Auth - Admin Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    if (res.status === 200 && res.data.token && res.data.user?.isAdmin) {
      adminToken = res.data.token;
      adminId = res.data.user.id;
      recordPass('Auth - Admin Login', `User: ${res.data.user.email}, Admin: ${res.data.user.isAdmin}`);
    } else {
      recordFail('Auth - Admin Login', new Error('Invalid login response'));
    }
  } catch (err) {
    recordFail('Auth - Admin Login', err);
  }

  // 3. Auth - Regular User Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@example.com',
      password: 'user123',
    });
    if (res.status === 200 && res.data.token) {
      userToken = res.data.token;
      userId = res.data.user.id;
      recordPass('Auth - Regular User Login', `User: ${res.data.user.email}`);
    } else {
      recordFail('Auth - Regular User Login', new Error('Invalid login response'));
    }
  } catch (err) {
    recordFail('Auth - Regular User Login', err);
  }

  // 4. Auth - Registration
  const testEmail = `test_${Date.now()}@example.com`;
  let registeredToken = '';
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Automated Tester',
      email: testEmail,
      password: 'testpassword123',
    });
    if (res.status === 201 && res.data.token) {
      registeredToken = res.data.token;
      recordPass('Auth - Register User', `Registered: ${testEmail}`);
    } else {
      recordFail('Auth - Register User', new Error('Registration failed'));
    }
  } catch (err) {
    recordFail('Auth - Register User', err);
  }

  // 5. Auth - Get Current User (/auth/me)
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (res.status === 200 && res.data.email === 'user@example.com') {
      recordPass('Auth - Get Current User (/auth/me)', `Email: ${res.data.email}`);
    } else {
      recordFail('Auth - Get Current User (/auth/me)', new Error('User email mismatch'));
    }
  } catch (err) {
    recordFail('Auth - Get Current User (/auth/me)', err);
  }

  // 6. Auth - Send OTP & Verify OTP
  try {
    const otpRes = await axios.post(`${BASE_URL}/auth/send-otp`, {
      email: 'otp_test@example.com',
      purpose: 'login',
    });
    if (otpRes.status === 200 && otpRes.data.devOtp) {
      const devOtp = otpRes.data.devOtp;
      recordPass('Auth - Send OTP', `OTP generated: ${devOtp}`);

      const verifyRes = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        email: 'otp_test@example.com',
        otp: devOtp,
      });
      if (verifyRes.status === 200 && verifyRes.data.token) {
        recordPass('Auth - Verify OTP', 'OTP login successful');
      } else {
        recordFail('Auth - Verify OTP', new Error('Failed to verify OTP'));
      }
    } else {
      recordFail('Auth - Send OTP', new Error('No devOtp returned'));
    }
  } catch (err) {
    recordFail('Auth - Send / Verify OTP', err);
  }

  // 7. Auth - Update Profile & Preferences
  try {
    const prefRes = await axios.put(
      `${BASE_URL}/auth/preferences`,
      { theme: 'dark', language: 'en' },
      { headers: { Authorization: `Bearer ${registeredToken}` } }
    );
    if (prefRes.status === 200) {
      recordPass('Auth - Update Preferences', `Theme: ${prefRes.data.user.theme}`);
    } else {
      recordFail('Auth - Update Preferences', new Error('Preference update failed'));
    }
  } catch (err) {
    recordFail('Auth - Update Preferences', err);
  }

  // 8. Topics - List & Detail
  try {
    const res = await axios.get(`${BASE_URL}/topics`);
    if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
      createdTopicId = res.data[0].id;
      recordPass('Topics - List All Topics', `Count: ${res.data.length}`);
    } else {
      recordFail('Topics - List All Topics', new Error('No topics found'));
    }
  } catch (err) {
    recordFail('Topics - List All Topics', err);
  }

  // 9. Tags - List
  try {
    const res = await axios.get(`${BASE_URL}/tags`);
    if (res.status === 200 && Array.isArray(res.data)) {
      recordPass('Tags - List All Tags', `Count: ${res.data.length}`);
    } else {
      recordFail('Tags - List All Tags', new Error('Invalid tags response'));
    }
  } catch (err) {
    recordFail('Tags - List All Tags', err);
  }

  // 10. Templates - List Public Templates
  try {
    const res = await axios.get(`${BASE_URL}/templates`);
    const templatesList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.templates || []);
    if (res.status === 200 && Array.isArray(templatesList) && templatesList.length > 0) {
      recordPass('Templates - List Templates', `Count: ${templatesList.length}`);
    } else {
      recordFail('Templates - List Templates', new Error('No templates found'));
    }
  } catch (err) {
    recordFail('Templates - List Templates', err);
  }

  // 11. Templates - Create Template
  try {
    const res = await axios.post(
      `${BASE_URL}/templates`,
      {
        title: 'Automated Test Form Template',
        description: 'Template created during automated test execution.',
        isPublic: true,
        topicId: createdTopicId,
        tags: ['Popular', 'Testing'],
        isQuiz: false,
        customString1State: true,
        customString1Question: 'What is your full name?',
        customText1State: true,
        customText1Question: 'Any additional comments?',
        customInt1State: true,
        customInt1Question: 'Rate your satisfaction (1-10)',
        customCheckbox1State: true,
        customCheckbox1Question: 'Agree to terms and conditions?',
        questionOrder: JSON.stringify(['customString1', 'customText1', 'customInt1', 'customCheckbox1']),
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.status === 201 && res.data.id) {
      createdTemplateId = res.data.id;
      recordPass('Templates - Create Template', `Created ID: ${createdTemplateId}`);
    } else {
      recordFail('Templates - Create Template', new Error('Creation failed'));
    }
  } catch (err) {
    recordFail('Templates - Create Template', err);
  }

  // 12. Templates - Get Template by ID
  try {
    const res = await axios.get(`${BASE_URL}/templates/${createdTemplateId}`);
    if (res.status === 200 && res.data.title === 'Automated Test Form Template') {
      recordPass('Templates - Get Template by ID', `Title: ${res.data.title}`);
    } else {
      recordFail('Templates - Get Template by ID', new Error('Title mismatch'));
    }
  } catch (err) {
    recordFail('Templates - Get Template by ID', err);
  }

  // 13. Templates - Toggle Like & Get Count
  try {
    const likeRes = await axios.post(
      `${BASE_URL}/likes/template/${createdTemplateId}`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (likeRes.status === 200 || likeRes.status === 201) {
      recordPass('Templates - Toggle Like', `Liked: ${likeRes.data.liked}`);

      const countRes = await axios.get(`${BASE_URL}/likes/count/${createdTemplateId}`);
      if (countRes.status === 200 && typeof countRes.data.count === 'number') {
        recordPass('Likes - Get Likes Count', `Count: ${countRes.data.count}`);
      } else {
        recordFail('Likes - Get Likes Count', new Error('Invalid count response'));
      }
    } else {
      recordFail('Templates - Toggle Like', new Error('Toggle like failed'));
    }
  } catch (err) {
    recordFail('Templates - Toggle Like & Count', err);
  }

  // 14. Comments - Add Comment & List Comments
  try {
    const addRes = await axios.post(
      `${BASE_URL}/comments`,
      {
        templateId: createdTemplateId,
        content: 'This is an automated test comment.',
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (addRes.status === 201) {
      recordPass('Comments - Add Comment', 'Comment created');

      const listRes = await axios.get(`${BASE_URL}/comments/template/${createdTemplateId}`);
      if (listRes.status === 200 && Array.isArray(listRes.data) && listRes.data.length > 0) {
        recordPass('Comments - List Comments for Template', `Comments count: ${listRes.data.length}`);
      } else {
        recordFail('Comments - List Comments for Template', new Error('No comments returned'));
      }
    } else {
      recordFail('Comments - Add Comment', new Error('Add comment failed'));
    }
  } catch (err) {
    recordFail('Comments - Add & List Comments', err);
  }

  // 15. Form Responses - Submit Response
  try {
    const res = await axios.post(
      `${BASE_URL}/responses`,
      {
        templateId: createdTemplateId,
        customString1Answer: 'John Tester',
        customText1Answer: 'Test comment answer.',
        customInt1Answer: 9,
        customCheckbox1Answer: true,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.status === 201 && res.data.response?.id) {
      createdResponseId = res.data.response.id;
      recordPass('Form Responses - Submit Response', `Response ID: ${createdResponseId}`);
    } else {
      recordFail('Form Responses - Submit Response', new Error('Submission failed'));
    }
  } catch (err) {
    recordFail('Form Responses - Submit Response', err);
  }

  // 16. Form Responses - Get Aggregate Data
  try {
    const res = await axios.get(`${BASE_URL}/responses/aggregate/${createdTemplateId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (res.status === 200 && res.data.total_responses >= 1) {
      recordPass('Form Responses - Get Aggregate Data', `Total responses: ${res.data.total_responses}`);
    } else {
      recordFail('Form Responses - Get Aggregate Data', new Error('Invalid aggregate data'));
    }
  } catch (err) {
    recordFail('Form Responses - Get Aggregate Data', err);
  }

  // 17. AI - Generate Form & Improve Form
  try {
    const genRes = await axios.post(
      `${BASE_URL}/ai/generate-form`,
      { prompt: 'A customer satisfaction survey for a tech startup' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (genRes.status === 200 && genRes.data.title && Array.isArray(genRes.data.questions)) {
      recordPass('AI - Generate Form', `Title: "${genRes.data.title}", Questions: ${genRes.data.questions.length}`);

      const impRes = await axios.post(
        `${BASE_URL}/ai/improve-form`,
        { formData: genRes.data, instructions: 'Add a question about customer support' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (impRes.status === 200 && impRes.data.title) {
        recordPass('AI - Improve Form', `Improved Title: "${impRes.data.title}"`);
      } else {
        recordFail('AI - Improve Form', new Error('Improve form returned invalid data'));
      }
    } else {
      recordFail('AI - Generate Form', new Error('Generate form failed'));
    }
  } catch (err) {
    recordFail('AI - Generate & Improve Form', err);
  }

  // 18. Admin - Dashboard Stats
  try {
    const res = await axios.get(`${BASE_URL}/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status === 200 && typeof res.data.users === 'number' && typeof res.data.templates === 'number') {
      recordPass('Admin - Dashboard Stats', `Users: ${res.data.users}, Templates: ${res.data.templates}, Responses: ${res.data.responses}`);
    } else {
      recordFail('Admin - Dashboard Stats', new Error('Invalid dashboard stats'));
    }
  } catch (err) {
    recordFail('Admin - Dashboard Stats', err);
  }

  // 19. Admin - List Users & Users Count
  try {
    const res = await axios.get(`${BASE_URL}/admin/users?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.users)) {
      recordPass('Admin - List Users', `Count: ${res.data.users.length}`);

      const countRes = await axios.get(`${BASE_URL}/admin/users-count`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (countRes.status === 200 && typeof countRes.data.count === 'number') {
        recordPass('Admin - Users Count', `Total Users: ${countRes.data.count}`);
      } else {
        recordFail('Admin - Users Count', new Error('Invalid users count'));
      }
    } else {
      recordFail('Admin - List Users', new Error('Failed to list users'));
    }
  } catch (err) {
    recordFail('Admin - List Users & Count', err);
  }

  // 20. Admin - List Templates & Template Responses
  try {
    const res = await axios.get(`${BASE_URL}/admin/templates`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.templates)) {
      recordPass('Admin - List All Templates', `Count: ${res.data.templates.length}`);

      const respRes = await axios.get(`${BASE_URL}/admin/templates/${createdTemplateId}/responses`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (respRes.status === 200 && Array.isArray(respRes.data)) {
        recordPass('Admin - Get Template Responses', `Responses: ${respRes.data.length}`);
      } else {
        recordFail('Admin - Get Template Responses', new Error('Failed to fetch template responses'));
      }
    } else {
      recordFail('Admin - List All Templates', new Error('Failed to fetch admin templates'));
    }
  } catch (err) {
    recordFail('Admin - List Templates & Template Responses', err);
  }

  // 21. Admin - List Responses
  try {
    const res = await axios.get(`${BASE_URL}/admin/responses`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.responses)) {
      recordPass('Admin - List All Responses', `Count: ${res.data.responses.length}`);
    } else {
      recordFail('Admin - List All Responses', new Error('Failed to fetch admin responses'));
    }
  } catch (err) {
    recordFail('Admin - List All Responses', err);
  }

  // 22. Cleanup - Delete Created Template
  if (createdTemplateId) {
    try {
      // Fetch latest template details to get exact current version
      const freshRes = await axios.get(`${BASE_URL}/templates/${createdTemplateId}`);
      const freshVersion = freshRes.data.version ?? 0;

      const res = await axios.delete(`${BASE_URL}/templates/${createdTemplateId}?version=${freshVersion}`, {
        headers: { Authorization: `Bearer ${userToken}`, 'X-Version': String(freshVersion) },
      });
      if (res.status === 200) {
        recordPass('Cleanup - Delete Created Template', `Deleted ID: ${createdTemplateId}`);
      } else {
        recordFail('Cleanup - Delete Created Template', new Error('Delete failed'));
      }
    } catch (err) {
      recordFail('Cleanup - Delete Created Template', err);
    }
  }

  console.log('\n====================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`📊 Final Test Results: ${passedCount} PASSED, ${failedCount} FAILED out of ${results.length} total tests.`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
