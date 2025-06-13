const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process for Vercel deployment...');

const envProdPath = path.join(__dirname, '.env.production');
if (!fs.existsSync(envProdPath)) {
  console.log('Creating .env.production file with default values...');
  const defaultEnv = `
NODE_ENV=production
PORT=3000
CLIENT_URL=https://readyforms.vercel.app,http://localhost:3000
ALLOW_ALL_ORIGINS=true
API_BASE_URL=https://readyforms-api.vercel.app
`;
  fs.writeFileSync(envProdPath, defaultEnv.trim());
}

try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Building the API...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
