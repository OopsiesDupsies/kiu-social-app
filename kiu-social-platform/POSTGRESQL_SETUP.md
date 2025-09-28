# PostgreSQL Setup Guide for KIU Social Platform

This guide will help you set up the KIU Social Platform with PostgreSQL instead of MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Make sure to install pgAdmin (optional but recommended)

### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Database and User

1. Open a terminal/command prompt
2. Connect to PostgreSQL as the superuser:
   ```bash
   psql -U postgres
   ```

3. Create the database and user:
   ```sql
   -- Create database
   CREATE DATABASE kiu_social;
   
   -- Create user
   CREATE USER kiu_user WITH PASSWORD 'your_secure_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE kiu_social TO kiu_user;
   
   -- Connect to the new database
   \c kiu_social
   
   -- Grant schema privileges
   GRANT ALL ON SCHEMA public TO kiu_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kiu_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kiu_user;
   
   -- Exit psql
   \q
   ```

## Step 3: Configure Environment Variables

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Update the `.env` file with your database credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://kiu_user:your_secure_password@localhost:5432/kiu_social?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:5173
   ```

## Step 4: Run Database Migrations

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Run the initial migration to create all tables:
   ```bash
   npx prisma migrate dev --name init
   ```

   This will:
   - Create all the database tables based on the Prisma schema
   - Generate the Prisma client
   - Set up the database structure

## Step 5: Start the Application

1. From the root directory, start both frontend and backend:
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

## Database Schema

The PostgreSQL database includes the following tables:

- **users** - User accounts and profiles
- **posts** - Social media posts
- **comments** - Comments on posts (with nested replies)
- **messages** - Direct messages between users
- **user_friends** - Friend relationships (many-to-many)
- **user_blocks** - Blocked user relationships
- **post_likes** - Post likes (many-to-many)
- **comment_likes** - Comment likes (many-to-many)

## Useful PostgreSQL Commands

### Connect to Database
```bash
psql -U kiu_user -d kiu_social
```

### View All Tables
```sql
\dt
```

### View Table Structure
```sql
\d table_name
```

### Reset Database (Development Only)
```bash
cd server
npx prisma migrate reset
```

### View Database in Prisma Studio
```bash
cd server
npx prisma studio
```

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL service is running
- Check if the port 5432 is available
- Verify username and password in DATABASE_URL
- Make sure the database `kiu_social` exists

### Migration Issues
- Ensure you're in the server directory when running migrations
- Check that DATABASE_URL is correctly set
- Try running `npx prisma generate` first

### Permission Issues
- Make sure the user has proper privileges on the database
- Check if the user can connect to the database manually

## Performance Tips

1. **Indexes**: The Prisma schema includes appropriate indexes for common queries
2. **Connection Pooling**: Consider using PgBouncer for production
3. **Query Optimization**: Use Prisma's query optimization features
4. **Monitoring**: Use PostgreSQL's built-in monitoring tools

## Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **Database Security**: Implement proper user permissions and SSL
3. **Backups**: Set up regular database backups
4. **Monitoring**: Implement database monitoring and alerting
5. **Scaling**: Consider read replicas for read-heavy workloads

## Support

If you encounter any issues:
1. Check the PostgreSQL logs
2. Verify your environment variables
3. Ensure all dependencies are installed
4. Check the Prisma documentation: [https://www.prisma.io/docs/](https://www.prisma.io/docs/)

For KIU-specific issues, contact the development team.
