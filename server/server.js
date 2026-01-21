// // File: server/server.js

// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

// const app = express();

// console.log('\n🚀 Starting Nexus Platform Server...\n');

// // ===========================================
// // DATABASE CONNECTION
// // ===========================================
// const connectDB = async () => {
//   try {
//     console.log('🔄 Connecting to MongoDB Atlas...');
//     console.log('📊 Database: nexus_platform');
//     console.log('🌐 Cluster: binaya.goq6t5f.mongodb.net\n');
    
//     // ⭐ REMOVED deprecated options
//     const conn = await mongoose.connect(process.env.MONGODB_URI);

//     console.log('✅ MongoDB Connected Successfully!');
//     console.log(`📍 Host: ${conn.connection.host}`);
//     console.log(`💾 Database: ${conn.connection.name}\n`);
    
//     // Connection events
//     mongoose.connection.on('error', (err) => {
//       console.error('❌ MongoDB connection error:', err);
//     });

//     mongoose.connection.on('disconnected', () => {
//       console.log('⚠️  MongoDB disconnected');
//     });

//   } catch (error) {
//     console.error(`\n❌ MongoDB Connection Failed!`);
//     console.error(`Error: ${error.message}\n`);
//     process.exit(1);
//   }
// };

// // Connect to database
// connectDB();

// // ===========================================
// // MIDDLEWARE (MUST BE BEFORE ROUTES)
// // ===========================================
// // CORS configuration - allow multiple origins for development
// const allowedOrigins = process.env.CLIENT_URL 
//   ? process.env.CLIENT_URL.split(',').map(url => url.trim())
//   : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'];

// // In development, allow all localhost origins
// const isDevelopment = process.env.NODE_ENV !== 'production';

// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (like mobile apps, Postman, or curl requests)
//     if (!origin) {
//       return callback(null, true);
//     }
    
//     // In development, allow any localhost origin
//     if (isDevelopment && origin.includes('localhost')) {
//       return callback(null, true);
//     }
    
//     // Check if origin is in allowed list
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
    
//     // Reject other origins
//     console.warn(`CORS blocked origin: ${origin}`);
//     callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));


// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));
// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Request logger
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`);
//   if (req.method === 'OPTIONS' || req.path.includes('/auth/register')) {
//     console.log(`  Origin: ${req.headers.origin || 'none'}`);
//     console.log(`  Headers:`, req.headers['access-control-request-headers'] || 'none');
//   }
//   next();
// });

// // ===========================================
// // ROUTES
// // ===========================================

// // Welcome route
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: '🚀 Welcome to Nexus Platform API',
//     description: 'Australian Migration & Education Consultancy Platform',
//     version: '1.0.0',
//     timestamp: new Date().toISOString(),
//     documentation: '/api/docs',
//     endpoints: {
//       health: 'GET /api/health',
//       database: 'GET /api/db-test',
//       auth: {
//         register: 'POST /api/auth/register',
//         login: 'POST /api/auth/login'
//       },
//       students: 'GET /api/students',
//       agents: 'GET /api/agents',
//       applications: 'GET /api/applications',
//       form956: 'GET /api/form956'
//     }
//   });
// });

// // Health check route
// app.get('/api/health', (req, res) => {
//   const dbStatus = mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected';
  
//   res.json({
//     success: true,
//     message: 'Nexus Platform API is running smoothly',
//     timestamp: new Date().toISOString(),
//     uptime: `${Math.floor(process.uptime())} seconds`,
//     database: {
//       status: dbStatus,
//       name: mongoose.connection.name,
//       host: mongoose.connection.host,
//       readyState: mongoose.connection.readyState
//     },
//     environment: process.env.NODE_ENV || 'development',
//     server: {
//       port: process.env.PORT || 5000,
//       node_version: process.version,
//       platform: process.platform
//     },
//     mongodb: {
//       cluster: 'binaya.goq6t5f.mongodb.net',
//       database: 'nexus_platform',
//       username: 'Binay_admin'
//     }
//   });
// });

// // Database test route
// app.get('/api/db-test', async (req, res) => {
//   try {
//     if (mongoose.connection.readyState !== 1) {
//       return res.status(503).json({
//         success: false,
//         message: 'Database not connected'
//       });
//     }

//     // Get database stats
//     const stats = await mongoose.connection.db.stats();
    
//     // List all collections
//     const collections = await mongoose.connection.db.listCollections().toArray();
    
//     // Test write
//     const testCollection = mongoose.connection.db.collection('api_test');
//     await testCollection.insertOne({
//       test: 'API Test',
//       timestamp: new Date(),
//       from: 'health-check-endpoint'
//     });
    
//     // Cleanup
//     await testCollection.deleteMany({ from: 'health-check-endpoint' });

//     res.json({
//       success: true,
//       message: 'Database connection test passed',
//       database: {
//         name: mongoose.connection.name,
//         host: mongoose.connection.host,
//         collections: collections.map(c => c.name),
//         stats: {
//           collections: stats.collections,
//           dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
//           indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
//           storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`
//         }
//       },
//       operations: {
//         write: '✅ Successful',
//         read: '✅ Successful',
//         delete: '✅ Successful'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Database test failed',
//       error: error.message
//     });
//   }
// });

// // API info route
// app.get('/api', (req, res) => {
//   res.json({
//     success: true,
//     name: 'Nexus Platform API',
//     version: '1.0.0',
//     description: 'Backend API for Australian Migration & Education Platform',
//     features: [
//       'Multi-tenant architecture',
//       'OMARA compliance',
//       'Form 956 generation',
//       'AI-powered migration compass',
//       'PR points calculator',
//       'Application workflow management',
//       'Trust accounting',
//       'Document management with OCR'
//     ],
//     modules: {
//       auth: 'Authentication & Authorization',
//       students: 'Student profiles and applications',
//       agents: 'Registered migration agents',
//       consultancies: 'Consultancy management',
//       applications: 'Visa application tracking',
//       form956: 'Digital Form 956 generation',
//       documents: 'Document storage and versioning',
//       'trust-accounting': 'Client fund management',
//       'points-calculator': 'PR points calculation',
//       'ai-compass': 'AI migration assistant'
//     },
//     status: 'operational'
//   });
// });

// // ============================================
// // API ROUTES (Must be after middleware setup)
// // ============================================

// // Auth routes
// app.use('/api/auth', require('./routes/auth.routes'));

// // Student routes
// app.use('/api/students', require('./routes/student.routes'));

// // Calculator routes
// app.use('/api/calculator', require('./routes/calculator.routes'));

// // Agent routes
// app.use('/api/agents', require('./routes/agent.routes'));


// // Additional routes (will add later)
// // app.use('/api/agents', require('./routes/agent.routes'));

// app.use('/api/applications', require('./routes/application.routes'));


// // Form 956 routes
// app.use('/api/form956', require('./routes/form956.routes'));


// // ERROR HANDLERS
// // ===========================================

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.url}`,
//     availableRoutes: [
//       'GET /',
//       'GET /api',
//       'GET /api/health',
//       'GET /api/db-test',
//       'POST /api/auth/register',
//       'POST /api/auth/login'
//     ]
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('\n❌ Error occurred:');
//   console.error('Path:', req.path);
//   console.error('Method:', req.method);
//   console.error('Error:', err.message);
//   console.error('Stack:', err.stack);

//   // Set CORS headers even on errors
//   const origin = req.headers.origin;
//   if (origin && (isDevelopment && origin.includes('localhost') || allowedOrigins.includes(origin))) {
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Credentials', 'true');
//   }

//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' && { 
//       stack: err.stack,
//       path: req.path,
//       method: req.method
//     })
//   });
// });

// // ===========================================
// // START SERVER
// // ===========================================
// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//   console.log('╔════════════════════════════════════════════╗');
//   console.log('║                                            ║');
//   console.log('║     🚀 NEXUS PLATFORM SERVER RUNNING      ║');
//   console.log('║                                            ║');
//   console.log('╚════════════════════════════════════════════╝');
//   console.log('');
//   console.log('  🌐 Port:          ', PORT);
//   console.log('  🌍 Environment:   ', process.env.NODE_ENV || 'development');
//   console.log('  📍 URL:           ', `http://localhost:${PORT}`);
//   console.log('  💚 Health Check:  ', `http://localhost:${PORT}/api/health`);
//   console.log('  📊 DB Test:       ', `http://localhost:${PORT}/api/db-test`);
//   console.log('  🔐 Register:      ', `http://localhost:${PORT}/api/auth/register`);
//   console.log('  🔑 Login:         ', `http://localhost:${PORT}/api/auth/login`);
//   console.log('');
//   console.log('════════════════════════════════════════════════');
//   console.log('');
//   console.log('  ✅ MongoDB Connected');
//   console.log('  ✅ API Routes Loaded');
//   console.log('  ✅ Auth Routes Active');
//   console.log('  ✅ Middleware Configured');
//   console.log('  ⏳ Ready to accept requests...');
//   console.log('');
//   console.log('════════════════════════════════════════════════\n');
// });

// // ===========================================
// // GRACEFUL SHUTDOWN
// // ===========================================
// const gracefulShutdown = async (signal) => {
//   console.log(`\n${signal} received. Starting graceful shutdown...`);
  
//   server.close(async () => {
//     console.log('✅ HTTP server closed');
    
//     try {
//       await mongoose.connection.close();
//       console.log('✅ MongoDB connection closed');
//       console.log('👋 Server shut down successfully\n');
//       process.exit(0);
//     } catch (error) {
//       console.error('❌ Error during shutdown:', error);
//       process.exit(1);
//     }
//   });

//   // Force shutdown after 10 seconds
//   setTimeout(() => {
//     console.error('⚠️  Forced shutdown after timeout');
//     process.exit(1);
//   }, 10000);
// };

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('\n💥 Unhandled Promise Rejection:');
//   console.error(err);
//   gracefulShutdown('UnhandledRejection');
// });

// module.exports = app;



require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const app = express();
const adminRoutes = require('./routes/admin.routes');

console.log('\n🚀 Starting Nexus Platform Server...\n');

// ===========================================
// DATABASE CONNECTION
// ===========================================
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('📊 Database: nexus_platform');
    console.log('🌐 Cluster: binaya.goq6t5f.mongodb.net\n');
    
    // ⭐ REMOVED deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);

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
// MIDDLEWARE (MUST BE BEFORE ROUTES)
// ===========================================
// CORS configuration - allow multiple origins for development
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'];

// In development, allow all localhost origins
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow any localhost origin
    if (isDevelopment && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.method === 'OPTIONS' || req.path.includes('/auth/register')) {
    console.log(`  Origin: ${req.headers.origin || 'none'}`);
    console.log(`  Headers:`, req.headers['access-control-request-headers'] || 'none');
  }
  next();
});
app.use('/api/admin', adminRoutes);

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
      form956: 'GET /api/form956',
      consultancy: {
        clients: 'GET /api/consultancy/clients'
      }
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

// ============================================
// API ROUTES (Must be after middleware setup)
// ============================================

// ✅ ADDED: Import consultancy routes
console.log('📦 Loading Route Modules...\n');

// Auth routes
console.log('  ✓ Auth routes');
app.use('/api/auth', require('./routes/auth.routes'));

// Student routes
console.log('  ✓ Student routes');
app.use('/api/students', require('./routes/student.routes'));

// Calculator routes
console.log('  ✓ Calculator routes');
app.use('/api/calculator', require('./routes/calculator.routes'));

// Agent routes
console.log('  ✓ Agent routes');
app.use('/api/agents', require('./routes/agent.routes'));

// Application routes
console.log('  ✓ Application routes');
app.use('/api/applications', require('./routes/application.routes'));

// Form 956 routes
console.log('  ✓ Form956 routes');
app.use('/api/form956', require('./routes/form956.routes'));

// ============================================
// 🆕 CONSULTANCY ROUTES SECTION
// ============================================
// These routes handle consultancy-specific operations
// Organization: /api/consultancy/{resource}

console.log('\n📋 Loading Consultancy Routes...\n');

// ✅ ADDED: Consultancy Client Routes
const clientRoutes = require('./routes/consultancy/clients.routes');
app.use('/api/consultancy/clients', clientRoutes);
console.log('  ✓ Consultancy Client routes');

// 🔄 COMMENTED OUT: Coming Soon
// const applicationRoutes = require('./routes/consultancy/applications.routes');
// app.use('/api/consultancy/applications', applicationRoutes);
// console.log('  ✓ Consultancy Application routes');

// const caseRoutes = require('./routes/consultancy/cases.routes');
// app.use('/api/consultancy/cases', caseRoutes);
// console.log('  ✓ Consultancy Case routes');

// const documentRoutes = require('./routes/consultancy/documents.routes');
// app.use('/api/consultancy/documents', documentRoutes);
// console.log('  ✓ Consultancy Document routes');

// const teamMemberRoutes = require('./routes/consultancy/teamMembers.routes');
// app.use('/api/consultancy/team-members', teamMemberRoutes);
// console.log('  ✓ Consultancy Team Member routes');

console.log('\n✅ All routes loaded successfully\n');

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    availableRoutes: [
      'GET /',
      'GET /api',
      'GET /api/health',
      'GET /api/db-test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/students',
      'GET /api/agents',
      'GET /api/applications',
      'GET /api/form956',
      'GET /api/consultancy/clients'
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

  // Set CORS headers even on errors
  const origin = req.headers.origin;
  if (origin && (isDevelopment && origin.includes('localhost') || allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

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
  console.log('  🔐 Register:      ', `http://localhost:${PORT}/api/auth/register`);
  console.log('  🔑 Login:         ', `http://localhost:${PORT}/api/auth/login`);
  console.log('  👥 Clients:       ', `http://localhost:${PORT}/api/consultancy/clients`);
  console.log('');
  console.log('════════════════════════════════════════════════');
  console.log('');
  console.log('  ✅ MongoDB Connected');
  console.log('  ✅ API Routes Loaded');
  console.log('  ✅ Consultancy Routes Loaded');
  console.log('  ✅ Auth Routes Active');
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