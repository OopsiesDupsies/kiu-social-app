const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🐘 Setting up KIU Social Platform with PostgreSQL...\n');

// Create .env file for server
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(serverEnvPath) && fs.existsSync(serverEnvExamplePath)) {
  fs.copyFileSync(serverEnvExamplePath, serverEnvPath);
  console.log('✅ Created server/.env file from example');
} else {
  console.log('ℹ️  Server .env file already exists or example not found');
}

console.log('\n📋 PostgreSQL Setup Instructions:');
console.log('1. Install PostgreSQL on your system:');
console.log('   - Windows: Download from https://www.postgresql.org/download/windows/');
console.log('   - macOS: brew install postgresql');
console.log('   - Ubuntu: sudo apt-get install postgresql postgresql-contrib');
console.log('');
console.log('2. Start PostgreSQL service:');
console.log('   - Windows: Start PostgreSQL service from Services');
console.log('   - macOS: brew services start postgresql');
console.log('   - Ubuntu: sudo systemctl start postgresql');
console.log('');
console.log('3. Create database and user:');
console.log('   psql -U postgres');
console.log('   CREATE DATABASE kiu_social;');
console.log('   CREATE USER kiu_user WITH PASSWORD \'your_password\';');
console.log('   GRANT ALL PRIVILEGES ON DATABASE kiu_social TO kiu_user;');
console.log('   \\q');
console.log('');
console.log('4. Update server/.env with your database credentials:');
console.log('   DATABASE_URL="postgresql://kiu_user:your_password@localhost:5432/kiu_social?schema=public"');
console.log('');

// Install dependencies
console.log('📦 Installing dependencies...');

try {
  console.log('Installing server dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}

console.log('\n🎉 PostgreSQL setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Set up PostgreSQL database (see instructions above)');
console.log('2. Update server/.env with your DATABASE_URL');
console.log('3. Run "npx prisma migrate dev" to create database tables');
console.log('4. Run "npm run dev" to start the development servers');
console.log('5. Open http://localhost:5173 in your browser');
console.log('\n📚 Check README.md for detailed documentation');
