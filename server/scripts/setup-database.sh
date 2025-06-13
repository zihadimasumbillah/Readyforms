#!/bin/bash

echo "Setting up database and sample data..."

# Install faker package if missing
if ! grep -q "@faker-js/faker" package.json; then
  echo "Installing @faker-js/faker package..."
  npm install @faker-js/faker@8.4.1 --save
fi

# Print environment info
echo "NODE_ENV: $NODE_ENV"
echo "Database connection: $DATABASE_URL"

# Run the seed script
echo "Running database seed script..."
npm run seed

echo "Setup complete!"
