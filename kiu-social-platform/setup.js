const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up KIU Social Platform...\n');

// Create .env file for server
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(serverEnvPath) && fs.existsSync(serverEnvExamplePath)) {
  fs.copyFileSync(serverEnvExamplePath, serverEnvPath);
  console.log('✅ Created server/.env file from example');
} else {
  console.log('ℹ️  Server .env file already exists or example not found');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing server dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Build server
console.log('\n🔨 Building server...');
try {
  execSync('npm run build', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  console.log('✅ Server built successfully!');
} catch (error) {
  console.error('❌ Error building server:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update server/.env with your MongoDB connection string');
console.log('3. Run "npm run dev" to start the development servers');
console.log('4. Open http://localhost:5173 in your browser');
console.log('\n📚 Check README.md for detailed documentation');
