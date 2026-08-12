# ⚡ ReadyForms - Enterprise-Grade Form & Quiz Platform

ReadyForms is a high-performance, enterprise-grade, customizable form and quiz builder application built with **Next.js 14 (App Router)**, **TypeScript**, **Express.js**, and **PostgreSQL (Sequelize ORM)**.

It features AI-powered form generation, real-time analytics, role-based access control, rich custom question types, interactive response submission, and an administrative oversight suite.

---

## ✨ Features

- **🤖 AI-Powered Form Generation**: Instantly generate complete, tailored form schemas from natural language prompts using OpenAI & AIHubMix API integration with zero-downtime fallback generation.
- **🛡️ Enterprise Security & RBAC**: Strict JWT-based authentication, password hashing (Argon2/bcrypt), CSRF & XSS sanitization, and route middleware for Admin vs User permissions.
- **📊 Real-Time Analytics & Dashboards**:
  - **User Dashboard**: Track created templates, submitted responses, received responses, likes, and comments.
  - **Admin Dashboard**: System-wide administrative oversight for users, templates, responses, and topics.
- **📝 Flexible Form Engine**: Supports short text, long text, integer inputs, and boolean checkboxes, with support for Quiz Mode and custom question ordering.
- **💬 Social Interactions**: Like, comment, share, and discuss templates in public directories.
- **📱 Responsive & Modern UI**: Built with Tailwind CSS, Radix UI primitives, glassmorphism aesthetics, dark mode support, and smooth micro-interactions.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Radix UI primitives.
- **Backend**: Node.js, Express.js, TypeScript, Sequelize ORM, PostgreSQL.
- **AI Engine**: OpenAI API / AIHubMix API with intelligent template fallbacks.
- **Security**: JWT (`jsonwebtoken`), Argon2 / Bcrypt, Helmet, Express Rate Limit, Input Validation.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher (Running locally or hosted via Supabase/Neon/Render)

### 2. Environment Setup

#### Server Configuration (`server/.env`)
```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5000,http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
ALLOW_ALL_ORIGINS=true

# AI Integration (OpenAI / AIHubMix)
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://aihubmix.com/v1
OPENAI_MODEL=gpt-4o-mini

# Database Settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=readyforms_db
DB_USER=postgres
DB_PASSWORD=postgres
```

#### Client Configuration (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Installation & Database Seeding

```bash
# Install dependencies for all workspaces
npm install
npm --prefix server install
npm --prefix client install

# Seed the database with initial users, topics, templates, and responses
npm --prefix server run seed
```

### 4. Running Locally

Run both client and server concurrently:
```bash
npm run dev
```

- **Client App**: `http://localhost:5000` (or `http://localhost:3000`)
- **Backend API**: `http://localhost:3001/api`
- **Health Endpoint**: `http://localhost:3001/health`

---

## 🔑 Default Credentials (Development)

- **Admin Account**:
  - Email: `admin@example.com`
  - Password: `admin123`
- **Standard User Account**:
  - Email: `user@example.com`
  - Password: `user123`

---

## 📦 Production Build

To build both client and server for production deployment:

```bash
# Build server & client
npm run build

# Start production server
npm run start
```

---

## 📄 License

This project is licensed under the MIT License.
