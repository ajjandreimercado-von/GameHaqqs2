# Deploying GameHaqqs2 to Vercel

This guide explains how to deploy the GameHaqqs2 application to Vercel.

## Project Structure

This is a full-stack application with:
- **Frontend**: React + Vite application (in `/frontend` directory)
- **Backend**: Laravel PHP API (in root directory)

## Deployment Strategy

**Vercel will host the frontend only**. The Laravel backend needs to be deployed separately to a PHP hosting service.

### Recommended Backend Hosting Options:
- **Railway** - Easy Laravel deployment with database
- **Heroku** - Popular platform with PHP support
- **DigitalOcean App Platform** - Simple deployment for Laravel
- **AWS Elastic Beanstalk** - Scalable PHP hosting
- **Traditional PHP hosting** - Namecheap, Hostinger, etc.

## Frontend Deployment to Vercel

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
2. The `vercel.json` configuration file is already set up in the root directory

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `./` (vercel.json handles the frontend directory)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - Replace with your actual Laravel backend URL

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from the project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (choose your account)
# - Link to existing project? No
# - Project name? gamehaqqs2
# - In which directory is your code located? ./

# Add environment variable
vercel env add VITE_API_URL

# Enter your production API URL when prompted
# Example: https://your-backend-url.com/api

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables

In your Vercel project settings, add:

```
VITE_API_URL=https://your-laravel-backend-url.com/api
```

**Important**: Replace `https://your-laravel-backend-url.com/api` with your actual Laravel backend URL once deployed.

## Backend Deployment

### Deploy Laravel Backend (Choose One Option)

#### Option 1: Railway (Recommended - Easy)

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Railway will auto-detect Laravel
5. Add a MySQL or PostgreSQL database
6. Configure environment variables in Railway dashboard
7. Note your deployment URL for the frontend

#### Option 2: DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
2. Create a new app from your repository
3. Select PHP as the environment
4. Add a managed database
5. Configure environment variables
6. Deploy and note the URL

#### Option 3: Traditional PHP Hosting

1. Export your database
2. Upload files via FTP/SFTP
3. Import database on hosting
4. Update `.env` file with production settings
5. Run `composer install --optimize-autoloader --no-dev`
6. Set up proper permissions for `storage` and `bootstrap/cache`

### Laravel Backend Configuration

Update your Laravel `.env` file with production settings:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-backend-url.com

DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Add your Vercel frontend URL to allowed origins
FRONTEND_URL=https://your-app.vercel.app
```

In `config/cors.php`, make sure your frontend URL is allowed:

```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
],
```

## Testing Your Deployment

1. Visit your Vercel URL (e.g., `https://gamehaqqs2.vercel.app`)
2. Test API connectivity
3. Check browser console for any CORS errors
4. Verify authentication works
5. Test key features

## Troubleshooting

### CORS Errors
- Make sure your Laravel backend has the frontend URL in CORS allowed origins
- Check that `config/cors.php` is properly configured
- Verify `.env` has the correct `FRONTEND_URL`

### API Connection Issues
- Verify `VITE_API_URL` environment variable is set in Vercel
- Check that your backend is accessible
- Test API endpoints directly using Postman or curl

### Build Errors
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify the build command is correct

### 404 Errors on Page Refresh
- The `vercel.json` already includes rewrites for SPA routing
- If still having issues, check that the rewrite configuration is correct

## Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `VITE_API_URL` if needed

## Continuous Deployment

Once set up, Vercel will automatically:
- Deploy on every push to your main branch
- Create preview deployments for pull requests
- Run builds and tests

## Environment Variables Reference

### Frontend (Vercel)
- `VITE_API_URL` - Your Laravel backend API URL

### Backend (Laravel)
- `APP_URL` - Your Laravel backend URL
- `FRONTEND_URL` - Your Vercel frontend URL
- Database credentials
- Other Laravel environment variables

## Support

For issues specific to:
- **Vercel deployment**: Check [Vercel Documentation](https://vercel.com/docs)
- **Laravel deployment**: Check [Laravel Deployment Guide](https://laravel.com/docs/deployment)
- **CORS issues**: Review [Laravel CORS Documentation](https://github.com/fruitcake/laravel-cors)
