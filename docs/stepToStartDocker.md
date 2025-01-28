# Steps to Start Logo Gallery with Docker

## Prerequisites
- Docker installed on your system
- Docker Compose installed on your system
- Git (optional, for cloning the repository)

## Project Setup

1. **Clone or create the project directory**
```bash
git clone <repository-url>
# or
mkdir logo-gallery && cd logo-gallery
```

2. **Ensure you have these essential files in your project:**

- `package.json` with required dependencies:
```json
{
  "name": "logo-gallery",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "lucide-react": "^0.303.0",
    "mongoose": "^8.0.0",
    "next": "14.0.4",
    "postcss": "^8.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0"
  }
}
```

- `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- `postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

.dark {
  --foreground-rgb: 255, 255, 255;
  --background-rgb: 0, 0, 0;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
```

3. **Create Docker configuration files**

- `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

- `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/logo-gallery
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - NEXT_PUBLIC_API_URL=http://localhost:3000
    depends_on:
      - mongodb
    volumes:
      - ./uploads:/app/uploads

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

- `.dockerignore`:
```
# Dependencies
node_modules
npm-debug.log
yarn-debug.log
yarn-error.log

# Next.js build output
.next
out

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Version control
.git
.gitignore

# IDE
.idea
.vscode

# OS generated files
.DS_Store
Thumbs.db

# Uploads directory
uploads/*
!uploads/.gitkeep
```

4. **Create uploads directory**
```bash
mkdir -p uploads
touch uploads/.gitkeep
```

## Starting the Application

1. **Build and start the containers**
```bash
docker-compose up --build
```

2. **Access the application**
- Frontend: http://localhost:3000
- MongoDB: localhost:27017

## Troubleshooting

1. **Check container logs**
```bash
# All containers
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs mongodb
```

2. **Rebuild containers**
```bash
# Stop containers
docker-compose down

# Remove volumes if needed
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

3. **Access MongoDB shell**
```bash
docker-compose exec mongodb mongosh
```

4. **Access app container**
```bash
docker-compose exec app sh
```

## Stopping the Application

```bash
# If running in foreground, press Ctrl+C
# Or in another terminal:
docker-compose down
```

## Important Notes

1. **Data Persistence**
   - Uploaded files are stored in the local `uploads` directory
   - MongoDB data is stored in a Docker volume
   - Changes to the code require rebuilding the containers

2. **Security**
   - Change the JWT_SECRET in production
   - Consider using Docker secrets for sensitive data
   - Add proper security measures for MongoDB in production

3. **Development**
   - Any changes to the code require rebuilding the containers
   - Use `docker-compose up --build` after code changes
   - Monitor logs for errors using `docker-compose logs`
``` 