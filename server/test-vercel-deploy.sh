#!/usr/bin/env zsh

# Test script for Vercel deployment configuration
# This script tests the Vercel entry point and database connection

echo "🔍 Testing Vercel Deployment Configuration"
echo "========================================="

# Check if database URL is set
if [[ -z "$DATABASE_URL" ]]; then
  echo "⚠️  WARNING: DATABASE_URL is not set. Using value from .env file if available."
fi

# Build the project
echo "\n📦 Building project..."
npm run build
if [[ $? -ne 0 ]]; then
  echo "❌ Build failed. Fix build errors before deploying."
  exit 1
fi
echo "✅ Build successful"

# Test the Vercel entry point
echo "\n🧪 Testing Vercel entry point..."
NODE_ENV=production node -e "
  try {
    const app = require('./vercel.entry.js');
    console.log('✅ Vercel entry point loaded successfully');
  } catch (error) {
    console.error('❌ Vercel entry point failed:', error);
    process.exit(1);
  }
"

if [[ $? -ne 0 ]]; then
  echo "❌ Vercel entry point test failed"
  exit 1
fi

# Test database connection
echo "\n🗄️  Testing database connection..."
NODE_ENV=production node -e "
  const { Sequelize } = require('sequelize');
  const dotenv = require('dotenv');
  dotenv.config();
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }
  
  console.log('Trying to connect to database...');
  
  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
  
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection successful');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err);
      process.exit(1);
    });
"

if [[ $? -ne 0 ]]; then
  echo "❌ Database connection test failed"
  exit 1
fi

echo "\n✅ All tests passed! Your configuration looks good for Vercel deployment."
echo "📝 Remember to set all required environment variables in Vercel project settings."
echo "🚀 Ready to deploy!"
