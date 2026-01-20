## Dependencies

# Create server directory
mkdir server
cd server

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken
npm install express-validator express-rate-limit
npm install @aws-sdk/client-s3 @aws-sdk/client-ses
npm install stripe
npm install socket.io
npm install node-cron
npm install winston
npm install nodemailer
npm install multer
npm install pdfkit
npm install crypto-js

# Install dev dependencies
npm install --save-dev nodemon eslint





# File: README.md

# 🚀 Orivisa - Nexus Australian Migration Platform

A comprehensive MERN stack platform for Australian migration consultancies, students, and registered migration agents (RMAs).

## 📋 Overview

Orivisa (Nexus Platform) is a dual-interface ecosystem designed for the Australian migration sector, ensuring OMARA Code of Conduct compliance while leveraging AI and automation.

### Key Features

- **Multi-tenant Architecture** - Complete data isolation
- **OMARA Compliance** - Built-in regulatory safeguards
- **Form 956 Digital Generation** - Automated form creation and e-signing
- **AI Migration Compass** - RAG-based intelligent assistant
- **PR Points Calculator** - Real-time calculation based on 2026 rules
- **Application Workflow** - Jira-like Kanban board for agents
- **Trust Accounting** - Client fund management
- **Document Management** - S3 storage with OCR parsing

## 🏗️ Architecture

