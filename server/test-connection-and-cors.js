// File: server/test-connection-and-cors.js
// Comprehensive test for server connection and CORS configuration

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testServerConnection() {
  console.log('🔍 Testing Server Connection...\n');
  console.log(`📍 API URL: ${API_URL}\n`);
  
  try {
    // Test 1: Basic health check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await axios.get(`${API_URL.replace('/api', '')}/api/health`);
    console.log('✅ Server is running!');
    console.log('   Status:', healthResponse.status);
    console.log('   Server Type:', healthResponse.headers.server || 'Unknown');
    console.log('   Database:', healthResponse.data.database?.status || 'Unknown');
    console.log('   Port:', healthResponse.data.server?.port || 'Unknown');
    console.log('');
    
    // Test 2: CORS Preflight (OPTIONS)
    console.log('2️⃣ Testing CORS Preflight (OPTIONS)...');
    try {
      const optionsResponse = await axios.options(`${API_URL}/auth/register`, {
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        validateStatus: () => true
      });
      
      console.log('   Status:', optionsResponse.status);
      const corsHeaders = {
        'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': optionsResponse.headers['access-control-allow-credentials']
      };
      
      if (corsHeaders['Access-Control-Allow-Origin']) {
        console.log('✅ CORS Headers Present:');
        Object.entries(corsHeaders).forEach(([key, value]) => {
          if (value) console.log(`   ${key}: ${value}`);
        });
      } else {
        console.log('❌ CORS Headers Missing!');
        console.log('   This means CORS is not properly configured.');
      }
      console.log('');
    } catch (error) {
      console.log('❌ CORS Preflight Failed:', error.message);
      console.log('');
    }
    
    // Test 3: Actual POST request with Origin header (simulating browser)
    console.log('3️⃣ Testing POST Request with Origin (Simulating Browser)...');
    const timestamp = Date.now();
    const testData = {
      email: `test${timestamp}@example.com`,
      password: 'Test123456!',
      role: 'student',
      firstName: 'Test',
      lastName: 'User',
      phone: '+61400000000'
    };
    
    try {
      const postResponse = await axios.post(`${API_URL}/auth/register`, testData, {
        headers: {
          'Origin': 'http://localhost:5173',
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
      });
      
      console.log('   Status:', postResponse.status);
      const responseCorsHeaders = {
        'Access-Control-Allow-Origin': postResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Credentials': postResponse.headers['access-control-allow-credentials']
      };
      
      if (postResponse.status === 201 || postResponse.status === 200) {
        console.log('✅ Registration Request Successful!');
        if (responseCorsHeaders['Access-Control-Allow-Origin']) {
          console.log('✅ CORS Headers in Response:');
          Object.entries(responseCorsHeaders).forEach(([key, value]) => {
            if (value) console.log(`   ${key}: ${value}`);
          });
        } else {
          console.log('⚠️  CORS Headers Missing in Response');
        }
      } else {
        console.log('⚠️  Registration returned status:', postResponse.status);
        console.log('   Message:', postResponse.data?.message || 'No message');
        if (responseCorsHeaders['Access-Control-Allow-Origin']) {
          console.log('✅ But CORS headers are present');
        } else {
          console.log('❌ And CORS headers are missing');
        }
      }
      console.log('');
    } catch (error) {
      console.log('❌ POST Request Failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || 'No message');
      }
      console.log('');
    }
    
    // Summary
    console.log('════════════════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('════════════════════════════════════════════════');
    console.log(`✅ Server is accessible at ${API_URL}`);
    console.log('⚠️  If CORS headers are missing, browser requests will fail');
    console.log('💡 Make sure your Node.js server is running on port 5000');
    console.log('💡 Check that CORS middleware is properly configured');
    console.log('');
    
  } catch (error) {
    console.error('❌ Connection Test Failed!');
    if (error.code === 'ECONNREFUSED') {
      console.error('   Server is not running or not accessible');
      console.error(`   Make sure the server is running on ${API_URL.replace('/api', '')}`);
    } else if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || 'No message');
    } else {
      console.error('   Error:', error.message);
    }
    console.log('');
    console.log('💡 To start the server:');
    console.log('   cd server && npm start');
    console.log('   or');
    console.log('   cd server && PORT=5000 node server.js');
    console.log('');
  }
}

testServerConnection();
