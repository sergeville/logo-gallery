# OAuth Setup Instructions for Logo Gallery

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project:
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: "Logo Gallery"
   - Click "Create"

3. Set up OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in required information:
     - App name: "Logo Gallery"
     - User support email: Your email
     - Developer contact email: Your email
   - Click "Save and Continue"
   - Skip scopes section
   - Add test users if needed
   - Click "Save and Continue"

4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name: "Logo Gallery Web Client"
   - Add Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Add Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click "Create"
   - A popup will show your Client ID and Client Secret
   - Copy both values for use in `.env.local`

5. Update `.env.local`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id-here"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   ```

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" > "New OAuth App"
3. Fill in application details:
   - Application name: "Logo Gallery"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Click "Register application"

4. On the next screen:
   - Copy the Client ID
   - Click "Generate a new client secret"
   - Copy the Client Secret immediately (it won't be shown again)

5. Update `.env.local`:
   ```env
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

## Complete Environment Setup

1. Create a `.env.local` file in your project root if it doesn't exist
2. Add all required environment variables:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET="logoGallerySecret123!@#"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # GitHub OAuth
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

## After Setup

1. Make sure MongoDB is running locally:
   ```bash
   brew services start mongodb-community
   ```
2. Restart the development server:
   ```bash
   npm run dev
   ```

## Important Notes

- Keep your client secrets secure and never commit them to version control
- For production:
  - Add production URLs to authorized origins and callbacks
  - Update environment variables on your hosting platform
  - Consider using a more secure secret storage solution
  - Generate a strong NEXTAUTH_SECRET using: `openssl rand -base64 32`

## Common Issues and Troubleshooting

1. Sign-in not working:
   - Verify all environment variables are set correctly in `.env.local`
   - Check that MongoDB is running (`brew services list`)
   - Ensure callback URLs match exactly in both provider settings and your code
   - Look for any error messages in the browser console or server logs

2. OAuth consent screen errors:
   - Make sure your email is verified with Google Cloud
   - Add your email as a test user if in testing mode
   - Verify all required fields are filled in the consent screen

3. Redirect URI errors:
   - Double-check the callback URLs in both Google Console and GitHub settings
   - Ensure they match exactly: `http://localhost:3000/api/auth/callback/google`
   - For GitHub: `http://localhost:3000/api/auth/callback/github`

4. Database connection issues:
   - Verify MongoDB is running: `brew services start mongodb-community`
   - Check the MongoDB connection string in `.env.local`
   - Ensure the database name matches your configuration

5. NextAuth configuration:
   - Make sure `NEXTAUTH_URL` matches your development URL
   - Verify `NEXTAUTH_SECRET` is set
   - Check that provider IDs and secrets are correctly copied 