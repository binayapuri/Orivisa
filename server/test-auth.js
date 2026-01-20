// File: test-auth.js (in root folder)

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Nexus Authentication System\n');
    console.log('==========================================\n');

    // Test 1: Register Student
    console.log('1️⃣ Registering Student...');
    const studentData = {
      email: 'student@test.com',
      password: 'Student123!',
      role: 'student',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+61400000000'
    };
    
    const registerStudent = await axios.post(`${API_URL}/auth/register`, studentData);
    console.log('✅ Student registered:', registerStudent.data.user.email);
    console.log('🎫 Token:', registerStudent.data.token.substring(0, 30) + '...\n');

    // Test 2: Register Agent
    console.log('2️⃣ Registering Agent...');
    const agentData = {
      email: 'agent@test.com',
      password: 'Agent123!',
      role: 'agent',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+61411111111',
      marnNumber: '1234567'
    };
    
    const registerAgent = await axios.post(`${API_URL}/auth/register`, agentData);
    console.log('✅ Agent registered:', registerAgent.data.user.email);
    console.log('📋 MARN:', registerAgent.data.profile.marnNumber, '\n');

    // Test 3: Login
    console.log('3️⃣ Testing Login...');
    const loginData = {
      email: 'student@test.com',
      password: 'Student123!'
    };
    
    const login = await axios.post(`${API_URL}/auth/login`, loginData);
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
