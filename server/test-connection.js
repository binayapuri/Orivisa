// File: test-connection.js

require('dotenv').config({ path: './server/.env' }); // Point to server/.env
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection for Nexus Platform\n');
console.log('==========================================\n');

const uri = process.env.MONGODB_URI || 'mongodb+srv://Binay_admin:Binay_admin@binaya.goq6t5f.mongodb.net/nexus_platform?retryWrites=true&w=majority';

// Show connection (hide password)
const safeUri = uri.replace(/:([^@]+)@/, ':****@');
console.log('📝 Connection URI:', safeUri);
console.log('👤 Username: Binay_admin');
console.log('🌐 Cluster: binaya.goq6t5f.mongodb.net');
console.log('📊 Database: nexus_platform\n');

console.log('⏳ Connecting...\n');

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ CONNECTION SUCCESSFUL!\n');
  console.log('📊 Connection Details:');
  console.log('   Database Name:', mongoose.connection.name);
  console.log('   Host:', mongoose.connection.host);
  console.log('   Port:', mongoose.connection.port);
  console.log('   Ready State:', mongoose.connection.readyState, '(1 = connected)\n');

  // Test write operation
  console.log('📝 Testing write operation...');
  const testCollection = mongoose.connection.db.collection('connection_test');
  const result = await testCollection.insertOne({
    test: 'Nexus Platform Connection Test',
    timestamp: new Date(),
    user: 'Binay_admin',
    message: 'MongoDB Atlas is working!'
  });
  console.log('✅ Write successful! Document ID:', result.insertedId);

  // Test read operation
  console.log('📖 Testing read operation...');
  const doc = await testCollection.findOne({ _id: result.insertedId });
  console.log('✅ Read successful! Message:', doc.message);

  // Cleanup
  console.log('🧹 Cleaning up test data...');
  await testCollection.deleteOne({ _id: result.insertedId });
  console.log('✅ Test data removed!\n');

  // List existing collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('📚 Existing Collections:');
  if (collections.length > 0) {
    collections.forEach(c => console.log(`   - ${c.name}`));
  } else {
    console.log('   (No collections yet - database is empty)');
  }

  await mongoose.connection.close();
  console.log('\n👋 Connection closed successfully');
  console.log('\n🎉 MongoDB Atlas is ready for Nexus Platform!\n');
  process.exit(0);

})
.catch((error) => {
  console.error('\n❌ CONNECTION FAILED!\n');
  console.error('Error Type:', error.name);
  console.error('Error Message:', error.message, '\n');

  if (error.message.includes('authentication failed')) {
    console.error('🔧 SOLUTION: Check your password');
  } else if (error.message.includes('ENOTFOUND')) {
    console.error('🔧 SOLUTION: Check internet connection or cluster address');
  }

  process.exit(1);
});
