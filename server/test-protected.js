// File: test-protected.js (in root folder)

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

async function testProtectedRoutes() {
  try {
    console.log('🧪 Testing Protected Routes\n');
    console.log('==========================================\n');

    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'student@test.com',
      password: 'Student123!'
    });
    
    authToken = login.data.token;
    console.log('✅ Login successful');
    console.log('🎫 Token received\n');

    // Step 2: Get Profile (Protected)
    console.log('2️⃣ Testing /api/auth/me (Protected)...');
    const profile = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved:', profile.data.user.email);
    console.log('👤 Role:', profile.data.user.role, '\n');

    // Step 3: Get Student Dashboard
    console.log('3️⃣ Testing /api/students/dashboard...');
    const dashboard = await axios.get(`${API_URL}/students/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Dashboard data retrieved');
    console.log('📊 Stats:', dashboard.data.stats, '\n');

    // Step 4: Calculate PR Points
    console.log('4️⃣ Testing PR Points Calculator...');
    const points = await axios.post(`${API_URL}/calculator/pr-points`, {
      age: 28,
      englishProficiency: 'proficient',
      australianEducation: 'bachelor_master',
      australianWorkExperience: 2,
      overseasWorkExperience: 3,
      professionalYear: true,
      naati: false
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Points calculated:', points.data.totalPoints);
    console.log('📋 Breakdown:', points.data.breakdown.map(b => `${b.category}: ${b.points}`).join(', '));
    console.log('🎯 Eligibility:', points.data.eligibility.subclass189, '\n');

    // Step 5: Test without token (should fail)
    console.log('5️⃣ Testing without token (should fail)...');
    try {
      await axios.get(`${API_URL}/auth/me`);
    } catch (error) {
      console.log('✅ Correctly rejected:', error.response.data.message, '\n');
    }

    console.log('🎉 All protected route tests passed!\n');

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

testProtectedRoutes();
