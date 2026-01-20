#!/bin/bash

set -e

PROJECT_NAME="nexus-platform-mern"

echo "🚀 Creating $PROJECT_NAME structure..."

# Root
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

touch README.md .gitignore docker-compose.yml package.json

# ---------------- SERVER ----------------
mkdir -p server/{config,middleware,models,routes,controllers,services,utils,jobs,tests/{unit,integration,e2e}}
touch server/package.json server/.env.example server/server.js

# Server config
touch server/config/{db.js,aws.config.js,stripe.config.js,multer.config.js}

# Server middleware
touch server/middleware/{auth.middleware.js,tenantIsolation.middleware.js,roleGuard.middleware.js,auditLog.middleware.js,messageFilter.middleware.js,rateLimiter.middleware.js,errorHandler.middleware.js}

# Server models
touch server/models/{User.model.js,Student.model.js,Agent.model.js,Consultancy.model.js,College.model.js,InsuranceProvider.model.js,Application.model.js,Form956.model.js,ServiceAgreement.model.js,Document.model.js,Message.model.js,Transaction.model.js,Commission.model.js,Lead.model.js,Review.model.js,AuditLog.model.js,Notification.model.js}

# Server routes
touch server/routes/{auth.routes.js,student.routes.js,agent.routes.js,consultancy.routes.js,college.routes.js,insurance.routes.js,application.routes.js,form956.routes.js,document.routes.js,message.routes.js,payment.routes.js,commission.routes.js,eligibility.routes.js,analytics.routes.js,admin.routes.js}

# Server controllers
touch server/controllers/{auth.controller.js,student.controller.js,agent.controller.js,consultancy.controller.js,college.controller.js,insurance.controller.js,application.controller.js,form956.controller.js,document.controller.js,message.controller.js,payment.controller.js,commission.controller.js,eligibility.controller.js,analytics.controller.js}

# Server services
touch server/services/{auth.service.js,eligibility.service.js,matching.service.js,form956.service.js,commission.service.js,notification.service.js,email.service.js,sms.service.js,s3.service.js,pdf.service.js,ocr.service.js,encryption.service.js,audit.service.js,analytics.service.js}

# Server utils
touch server/utils/{validators.js,sanitizers.js,formatters.js,constants.js,errors.js,helpers.js}

# Server jobs
touch server/jobs/{commissionCalculation.job.js,deadlineReminder.job.js,complianceCheck.job.js,dataCleanup.job.js}

# ---------------- CLIENT ----------------
mkdir -p client/{public/assets,src/{routes,layouts,pages,components,services,store/{slices,middleware},hooks,utils,assets},tests/{unit,integration}}
touch client/package.json client/.env.example client/vite.config.js client/tailwind.config.js
touch client/public/index.html

# Client core
touch client/src/{App.jsx,main.jsx,index.css}
touch client/src/routes/index.jsx

# Client layouts
touch client/src/layouts/{MainLayout.jsx,StudentLayout.jsx,AgentLayout.jsx,CollegeLayout.jsx,InsuranceLayout.jsx,AdminLayout.jsx}

# Client pages (high-level placeholders)
mkdir -p client/src/pages/{Landing,Auth,Student,Agent,College,Insurance,Admin}

# Components
mkdir -p client/src/components/{common,layout,student,agent,college,insurance,messaging}

# ---------------- AI SERVICE ----------------
mkdir -p ai-service
touch ai-service/README.md

# ---------------- INFRASTRUCTURE ----------------
mkdir -p infrastructure/{terraform,kubernetes}

echo "✅ Folder structure created successfully!"
echo "📁 Project ready: $PROJECT_NAME"
