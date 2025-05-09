import axios from 'axios';

/**
 * Test script to check API connectivity
 * This can be run both in development and production to diagnose issues
 */
export async function testApiConnectivity() {
  console.log('🔍 Starting API connectivity test...');
  
  // Test configuration values
  const environments = {
    production: 'https://readyforms-api.vercel.app/api',
    development: 'http://localhost:3001/api',
    // Try alternative development ports if needed
    developmentAlt: 'http://localhost:3000/api',
    // Try direct request to health endpoint
    healthProduction: 'https://readyforms-api.vercel.app/health',
    healthDevelopment: 'http://localhost:3001/health'
  };
  
  const results = {
    environment: process.env.NODE_ENV || 'unknown',
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || 'not set',
    tests: [] as any[],
    successful: false,
    recommendedEndpoint: ''
  };
  
  // Test each endpoint
  for (const [name, url] of Object.entries(environments)) {
    try {
      console.log(`Testing ${name} endpoint: ${url}`);
      const startTime = Date.now();
      const response = await axios.get(`${url}/ping`, { 
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      const duration = Date.now() - startTime;
      
      results.tests.push({
        endpoint: name,
        url: url,
        success: true,
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
      
      console.log(`✅ ${name} endpoint working - ${duration}ms`);
      
      // If this is the first successful test, recommend this endpoint
      if (!results.successful) {
        results.successful = true;
        results.recommendedEndpoint = url;
      }
    } catch (error: any) {
      results.tests.push({
        endpoint: name,
        url: url,
        success: false,
        error: error.message,
        status: error.response?.status
      });
      
      console.log(`❌ ${name} endpoint failed: ${error.message}`);
    }
  }
  
  // Special test for CORS issues
  try {
    const corsTest = await axios.get('https://readyforms-api.vercel.app/debug-cors', { 
      headers: { 'Origin': window.location.origin }
    });
    results.tests.push({
      endpoint: 'CORS Test',
      success: true,
      data: corsTest.data
    });
  } catch (error: any) {
    results.tests.push({
      endpoint: 'CORS Test',
      success: false,
      error: error.message,
      status: error.response?.status
    });
  }
  
  console.log('📋 API Test Results:', results);
  
  // Print recommendations
  if (results.successful) {
    console.log(`✅ Found working API endpoint: ${results.recommendedEndpoint}`);
    console.log('💡 Recommendation: Update your NEXT_PUBLIC_API_URL environment variable to this value');
  } else {
    console.log('❌ No working API endpoints found');
    console.log('💡 Recommendations:');
    console.log('  1. Make sure your backend server is running on port 3001');
    console.log('  2. Check CORS configuration on your server');
    console.log('  3. Verify network connectivity between client and server');
  }
  
  return results;
}

// Automatically run the test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔄 Auto-running API connectivity test in development mode');
  setTimeout(() => testApiConnectivity(), 1000);
}

export default testApiConnectivity;
