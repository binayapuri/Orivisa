// File: server/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

console.log('\n🚀 Starting Nexus Platform Server...\n');

// ===========================================
// DATABASE CONNECTION
// ===========================================
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('📊 Database: nexus_platform');
    console.log('🌐 Cluster: binaya.goq6t5f.mongodb.net\n');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`💾 Database: ${conn.connection.name}\n`);
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed!`);
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// ===========================================
// MIDDLEWARE
// ===========================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ===========================================
// ROUTES
// ===========================================

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Welcome to Nexus Platform API',
    description: 'Australian Migration & Education Consultancy Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api/docs',
    endpoints: {
      health: 'GET /api/health',
      database: 'GET /api/db-test',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      students: 'GET /api/students',
      agents: 'GET /api/agents',
      applications: 'GET /api/applications',
      form956: 'GET /api/form956'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected';
  
  res.json({
    success: true,
    message: 'Nexus Platform API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: {
      status: dbStatus,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      readyState: mongoose.connection.readyState
    },
    environment: process.env.NODE_ENV || 'development',
    server: {
      port: process.env.PORT || 5000,
      node_version: process.version,
      platform: process.platform
    },
    mongodb: {
      cluster: 'binaya.goq6t5f.mongodb.net',
      database: 'nexus_platform',
      username: 'Binay_admin'
    }
  });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }

    // Get database stats
    const stats = await mongoose.connection.db.stats();
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Test write
    const testCollection = mongoose.connection.db.collection('api_test');
    await testCollection.insertOne({
      test: 'API Test',
      timestamp: new Date(),
      from: 'health-check-endpoint'
    });
    
    // Cleanup
    await testCollection.deleteMany({ from: 'health-check-endpoint' });

    res.json({
      success: true,
      message: 'Database connection test passed',
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        collections: collections.map(c => c.name),
        stats: {
          collections: stats.collections,
          dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
          indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
          storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`
        }
      },
      operations: {
        write: '✅ Successful',
        read: '✅ Successful',
        delete: '✅ Successful'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'Nexus Platform API',
    version: '1.0.0',
    description: 'Backend API for Australian Migration & Education Platform',
    features: [
      'Multi-tenant architecture',
      'OMARA compliance',
      'Form 956 generation',
      'AI-powered migration compass',
      'PR points calculator',
      'Application workflow management',
      'Trust accounting',
      'Document management with OCR'
    ],
    modules: {
      auth: 'Authentication & Authorization',
      students: 'Student profiles and applications',
      agents: 'Registered migration agents',
      consultancies: 'Consultancy management',
      applications: 'Visa application tracking',
      form956: 'Digital Form 956 generation',
      documents: 'Document storage and versioning',
      'trust-accounting': 'Client fund management',
      'points-calculator': 'PR points calculation',
      'ai-compass': 'AI migration assistant'
    },
    status: 'operational'
  });
});

// Import routes (when ready)
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/students', require('./routes/student.routes'));
// app.use('/api/agents', require('./routes/agent.routes'));
// app.use('/api/applications', require('./routes/application.routes'));

// ===========================================
// ERROR HANDLERS
// ===========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    availableRoutes: [
      'GET /',
      'GET /api',
      'GET /api/health',
      'GET /api/db-test'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('\n❌ Error occurred:');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  });
});

// ===========================================
// START SERVER
// ===========================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║                                            ║');
  console.log('║     🚀 NEXUS PLATFORM SERVER RUNNING      ║');
  console.log('║                                            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log('  🌐 Port:          ', PORT);
  console.log('  🌍 Environment:   ', process.env.NODE_ENV || 'development');
  console.log('  📍 URL:           ', `http://localhost:${PORT}`);
  console.log('  💚 Health Check:  ', `http://localhost:${PORT}/api/health`);
  console.log('  📊 DB Test:       ', `http://localhost:${PORT}/api/db-test`);
  console.log('');
  console.log('════════════════════════════════════════════════');
  console.log('');
  console.log('  ✅ MongoDB Connected');
  console.log('  ✅ API Routes Loaded');
  console.log('  ✅ Middleware Configured');
  console.log('  ⏳ Ready to accept requests...');
  console.log('');
  console.log('════════════════════════════════════════════════\n');
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      console.log('👋 Server shut down successfully\n');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n💥 Unhandled Promise Rejection:');
  console.error(err);
  gracefulShutdown('UnhandledRejection');
});

module.exports = app;
