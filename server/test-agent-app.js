// File: test-agent-app.js (in root folder)

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let studentToken = '';
let agentToken = '';
let studentId = '';
let agentId = '';
let applicationId = '';

async function testAgentAndApplications() {
  try {
    console.log('🧪 Testing Agent & Application Management\n');
    console.log('==========================================\n');

    // Login as agent
    console.log('1️⃣ Logging in as Agent...');
    const agentLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'agent@test.com',
      password: 'Agent123!'
    });
    agentToken = agentLogin.data.token;
    agentId = agentLogin.data.profile._id;
    console.log('✅ Agent logged in\n');

    // Login as student
    console.log('2️⃣ Logging in as Student...');
    const studentLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'student@test.com',
      password: 'Student123!'
    });
    studentToken = studentLogin.data.token;
    studentId = studentLogin.data.profile._id;
    console.log('✅ Student logged in\n');

    // Get agent dashboard
    console.log('3️⃣ Getting Agent Dashboard...');
    const dashboard = await axios.get(`${API_URL}/agents/dashboard`, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    console.log('✅ Dashboard retrieved');
    console.log('📊 Stats:', dashboard.data.stats, '\n');

    // Create application
    console.log('4️⃣ Creating Application...');
    const newApp = await axios.post(`${API_URL}/applications`, {
      studentId: studentId,
      programDetails: {
        courseName: 'Master of Information Technology',
        courseCode: 'MIT001',
        level: 'Master',
        duration: '2 years',
        intake: 'February 2027',
        campus: 'Sydney',
        tuitionFee: 45000,
        currency: 'AUD'
      },
      visaDetails: {
        visaType: 'Student Visa',
        subclass: '500'
      }
    }, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    applicationId = newApp.data.application._id;
    console.log('✅ Application created:', newApp.data.application.applicationRef);
    console.log('📝 Status:', newApp.data.application.status, '\n');

    // Update application status
    console.log('5️⃣ Moving Application to Documents Pending...');
    const updateStatus = await axios.put(
      `${API_URL}/applications/${applicationId}/status`,
      {
        status: 'documents_pending',
        note: 'Awaiting passport and academic transcripts'
      },
      { headers: { Authorization: `Bearer ${agentToken}` }}
    );
    console.log('✅ Status updated to:', updateStatus.data.application.status, '\n');

    // Add note to application
    console.log('6️⃣ Adding Note to Application...');
    await axios.post(
      `${API_URL}/applications/${applicationId}/notes`,
      {
        content: 'Student confirmed intent to proceed with application',
        isPrivate: false
      },
      { headers: { Authorization: `Bearer ${agentToken}` }}
    );
    console.log('✅ Note added\n');

    // Get all applications
    console.log('7️⃣ Getting All Applications...');
    const allApps = await axios.get(`${API_URL}/applications`, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    console.log('✅ Retrieved', allApps.data.count, 'applications\n');

    console.log('🎉 All agent & application tests passed!\n');

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

testAgentAndApplications();
