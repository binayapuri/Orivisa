// File: test-auth.js (in root folder)

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testCORS() {
  try {
    console.log('🌐 Testing CORS Configuration...\n');
    
    // Simulate a browser request with origin header
    const response = await axios.options(`${API_URL}/auth/register`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      validateStatus: () => true // Don't throw on any status
    });
    
    console.log('OPTIONS Response Status:', response.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials']
    });
    
    if (response.status === 204 || response.status === 200) {
      console.log('✅ CORS preflight test passed\n');
      return true;
    } else {
      console.log('❌ CORS preflight test failed\n');
      return false;
    }
  } catch (error) {
    console.error('❌ CORS test error:', error.message);
    return false;
  }
}

async function testAuth() {
  try {
    console.log('🧪 Testing Nexus Authentication System\n');
    console.log('==========================================\n');
    console.log(`📍 API URL: ${API_URL}\n`);

    // Test CORS first
    await testCORS();

    // Test 1: Register Student (with unique email)
    console.log('1️⃣ Registering Student...');
    const timestamp = Date.now();
    const studentData = {
      email: `student${timestamp}@test.com`,
      password: 'Student123!',
      role: 'student',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+61400000000'
    };
    
    const registerStudent = await axios.post(`${API_URL}/auth/register`, studentData, {
      headers: {
        'Origin': 'http://localhost:5173' // Simulate browser request
      }
    });
    console.log('✅ Student registered:', registerStudent.data.user.email);
    console.log('🎫 Token:', registerStudent.data.token.substring(0, 30) + '...\n');

    // Test 2: Register Agent (with unique email)
    console.log('2️⃣ Registering Agent...');
    const agentData = {
      email: `agent${timestamp}@test.com`,
      password: 'Agent123!',
      role: 'agent',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+61411111111',
      marnNumber: `${String(timestamp).slice(-7)}` // Use last 7 digits as MARN
    };
    
    const registerAgent = await axios.post(`${API_URL}/auth/register`, agentData, {
      headers: {
        'Origin': 'http://localhost:5173' // Simulate browser request
      }
    });
    console.log('✅ Agent registered:', registerAgent.data.user.email);
    console.log('📋 MARN:', registerAgent.data.profile.marnNumber, '\n');

    // Test 3: Login
    console.log('3️⃣ Testing Login...');
    const loginData = {
      email: studentData.email,
      password: 'Student123!'
    };
    
    const login = await axios.post(`${API_URL}/auth/login`, loginData, {
      headers: {
        'Origin': 'http://localhost:5173' // Simulate browser request
      }
    });
    console.log('✅ Login successful');
    console.log('👤 User:', login.data.user.email);
    console.log('🎭 Role:', login.data.user.role);
    console.log('🎫 Token:', login.data.token.substring(0, 30) + '...\n');

    console.log('🎉 All authentication tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error(error.message);
    }
  }
}

testAuth();
