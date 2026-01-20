// File: test-form956.js

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let agentToken = '';
let studentToken = '';
let applicationId = '';
let form956Id = '';
let studentId = '';

async function testForm956() {
  try {
    console.log('🧪 Testing Form 956 Generation\n');
    console.log('==========================================\n');

    // Login as agent
    console.log('1️⃣ Logging in as Agent...');
    const agentLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'agent@test.com',
      password: 'Agent123!'
    });
    agentToken = agentLogin.data.token;
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

    // Create a NEW application for fresh test
    console.log('3️⃣ Creating NEW Application...');
    const newApp = await axios.post(`${API_URL}/applications`, {
      studentId: studentId,
      programDetails: {
        courseName: 'Master of Data Science',
        courseCode: 'MDS001',
        level: 'Master',
        duration: '2 years',
        intake: 'July 2027',
        campus: 'Melbourne',
        tuitionFee: 48000,
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
    console.log('✅ New application created:', newApp.data.application.applicationRef, '\n');

    // Create Form 956
    console.log('4️⃣ Generating Form 956...');
    const form = await axios.post(`${API_URL}/form956`, {
      applicationId: applicationId
    }, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    form956Id = form.data.form956._id;
    console.log('✅ Form 956 created:', form.data.form956.form956Ref);
    console.log('📝 Form ID:', form956Id);
    console.log('📝 Status:', form.data.form956.status, '\n');

    // Debug: Check form details
    console.log('🔍 Debugging: Checking form details...');
    const debugForm = await axios.get(`${API_URL}/form956/debug/${form956Id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Form tenant check:', debugForm.data.requestInfo.tenantMatch ? 'MATCH ✓' : 'MISMATCH ✗');
    console.log('📋 Form status:', debugForm.data.form956.status, '\n');

    // Student signs form
    console.log('5️⃣ Student Signing Form...');
    const studentSign = await axios.post(`${API_URL}/form956/${form956Id}/sign`, {
      signerType: 'applicant',
      fullName: 'John Smith',
      signature: 'base64_signature_data_here'
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Student signature added');
    console.log('📝 Signatures:', studentSign.data.signatures, '\n');

    // Agent signs form
    console.log('6️⃣ Agent Signing Form...');
    const signedForm = await axios.post(`${API_URL}/form956/${form956Id}/sign`, {
      signerType: 'agent',
      fullName: 'Sarah Johnson',
      signature: 'base64_signature_data_here'
    }, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    console.log('✅ Agent signature added');
    console.log('📋 Form Status:', signedForm.data.form956.status);
    console.log('🎯 All Signed:', signedForm.data.allSigned);
    console.log('📝 Signatures:', signedForm.data.signatures, '\n');

    // Verify application status updated
    console.log('7️⃣ Checking Application Status...');
    const updatedApp = await axios.get(`${API_URL}/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${agentToken}` }
    });
    console.log('✅ Application status:', updatedApp.data.application.status);
    console.log('📜 Timeline events:', updatedApp.data.application.timeline.length, '\n');

    console.log('🎉 Form 956 generation and signing complete!\n');
    console.log('Summary:');
    console.log('  Application:', newApp.data.application.applicationRef);
    console.log('  Form 956:', form.data.form956.form956Ref);
    console.log('  Status:', signedForm.data.form956.status);
    console.log('  Both signatures:', signedForm.data.allSigned ? '✅' : '❌');
    console.log('  Application updated:', updatedApp.data.application.status === 'form956_signed' ? '✅' : '❌');
    console.log('\n');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      if (error.response.data.debug) {
        console.error('Debug info:', error.response.data.debug);
      }
    } else {
      console.error(error.message);
    }
  }
}

testForm956();
