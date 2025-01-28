# Logo Gallery Setup Guide

## Prerequisites
- Node.js 18 or later
- MongoDB
- Git

## Initial Setup

### 1. Clean Slate Procedure
Before starting fresh, ensure no existing processes are running:

```bash
# Check for processes running on Next.js and MongoDB ports
lsof -i :3000,27017

# If Next.js is running, find its PID and stop it
# Replace <PID> with the actual process ID
kill <PID>

# Check for MongoDB processes
ps aux | grep mongod

# Clean up existing build artifacts
rm -rf node_modules .next package-lock.json
```

### 2. MongoDB Setup
```bash
# Start MongoDB (MacOS with Homebrew)
brew services start mongodb-community

# Verify MongoDB is running
brew services list | grep mongodb
```

### 3. Project Setup
```bash
# Install dependencies
npm install

# Create development environment file
cp .env.example .env.development

# Update .env.development with your values:
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=http://localhost:3000/
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-key-do-not-use-in-production
```

### 4. Development Server
```bash
# Start the development server
npm run dev

# The application will be available at:
# - Frontend: http://localhost:3000
# - API endpoints: http://localhost:3000/api/*
```

## Testing

### Setup Test Environment
```bash
# Run tests
npm test

# Watch mode for development
npm run test:watch

# Populate test database
npm run db:populate

# Validate database
npm run db:validate
```

## Common Issues and Solutions

### Port Already in Use
If port 3000 or 27017 is already in use:
1. Find the process: `lsof -i :3000` or `lsof -i :27017`
2. Stop the process: `kill <PID>`

### MongoDB Connection Issues
1. Verify MongoDB is running: `ps aux | grep mongod`
2. Check MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log`
3. Ensure connection string is correct in `.env.development`

## Project Structure
```
logo-gallery/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── models/           # MongoDB models
├── scripts/               # Utility scripts
├── e2e/                   # End-to-end tests
├── .env.development       # Development environment variables
├── package.json          # Project dependencies
└── SETUP.md              # This setup guide
```

## Development Workflow
1. Start MongoDB
2. Start Next.js development server
3. Make changes
4. Run tests to verify changes
5. Commit changes

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Database Maintenance
```bash
# Backup database
mongodump --db LogoGalleryDevelopmentDB

# Restore database
mongorestore --db LogoGalleryDevelopmentDB dump/LogoGalleryDevelopmentDB
``` 