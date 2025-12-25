wwwwwwwww# 🎮 GameHaqqs - Gaming Community Platform

A full-stack web application for gaming enthusiasts to discover games, share reviews, post tips and tricks, and engage with the gaming community.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

## ✨ Features

- **User Authentication** - Secure registration and login with token-based authentication
- **Games Library** - Browse, search, and view detailed game information
- **Reviews & Ratings** - Create and manage game reviews with rating system
- **Tips & Tricks** - Share gaming tips with the community
- **Community Posts** - Create posts and engage in discussions
- **Favorites** - Save favorite games to your profile
- **Role-Based Access** - User, Admin, and Moderator roles with different permissions
- **Admin Dashboard** - User management and analytics for administrators
- **Moderator Tools** - Content moderation features for moderators
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

**Backend:**
- Laravel 10
- MySQL Database
- Sanctum Authentication

**Frontend:**
- React 18
- TypeScript
- Vite

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.1 (check: `php --version`)
- **Composer** (check: `composer --version`)
- **Node.js** >= 16 (check: `node --version`)
- **npm** (check: `npm --version`)
- **MySQL** (via XAMPP, WAMP, or standalone)
- **Git** (optional, for version control)

## 🚀 Installation & Setup

### Step 1: Database Setup

1. **Start MySQL** (using XAMPP Control Panel or your MySQL server)

2. **Create the database:**
   ```bash
   mysql -u root -p
   ```
   Then run:
   ```sql
   CREATE DATABASE gamehaqqs_db;
   EXIT;
   ```

### Step 2: Backend Setup

1. **Navigate to the project root:**
   ```bash
   cd c:\laragon\www\GameHaqqs2
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Configure environment file:**
   - The `.env` file should already be configured
   - Verify database settings in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=gamehaqqs_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

5. **Run database migrations:**
   ```bash
   php artisan migrate
   ```
   
   *Optional - Seed with sample data:*
   ```bash
   php artisan db:seed
   ```

### Step 3: Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Return to project root:**
   ```bash
   cd ..
   ```

## ▶️ Running the Application

You'll need **TWO terminal windows** running simultaneously:

### Terminal 1: Backend Server

```bash
# From project root
php artisan serve
```

✅ Backend will run at: `http://127.0.0.1:8000`

### Terminal 2: Frontend Server

```bash
# From project root
cd frontend
npm run dev
```

✅ Frontend will run at: `http://localhost:5173`

### Access the Application

Open your browser and go to: **http://localhost:5173**

## 🔑 Default Credentials

After seeding the database, you can use these default accounts:

**Admin Account:**
- Email: `admin@gamehaqqs.com`
- Password: `password`

**Regular User:**
- Email: `user@gamehaqqs.com`
- Password: `password`

*Or register a new account using the registration form.*

## 🐛 Troubleshooting

### Database Connection Error
```
SQLSTATE[HY000] [1049] Unknown database 'gamehaqqs_db'
```
**Solution:** Make sure you created the database `gamehaqqs_db` in MySQL.

### Port Already in Use
```
Address already in use (127.0.0.1:8000)
```
**Solution:** Stop other processes using port 8000 or use a different port:
```bash
php artisan serve --port=8001
```

### CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution:** Verify that `config/cors.php` allows `http://localhost:5173` in allowed origins.

### Migration Errors
**Solution:** Reset and re-run migrations:
```bash
php artisan migrate:fresh
```

### Frontend Build Errors
**Solution:** Clear node modules and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Token Expiration
If you get "Unauthenticated" errors, clear browser localStorage and log in again.

## 📚 Documentation

For more detailed information, check these documentation files in the `md files/` directory:

- **[API_COMPLETE_DOCUMENTATION.md](md%20files/API_COMPLETE_DOCUMENTATION.md)** - Complete API reference
- **[QUICK_START.md](md%20files/QUICK_START.md)** - Quick start guide
- **[SETUP_COMPLETE.md](md%20files/SETUP_COMPLETE.md)** - Detailed setup instructions
- **[TROUBLESHOOTING.md](md%20files/TROUBLESHOOTING.md)** - Common issues and solutions
- **[PROJECT_DOCUMENTATION_INDEX.md](md%20files/PROJECT_DOCUMENTATION_INDEX.md)** - Documentation index

## 📁 Project Structure

```
GameHaqqs2/
├── app/                          # Laravel application code
│   ├── Http/Controllers/Api/     # API controllers
│   ├── Models/                   # Database models
│   └── ...
├── config/                       # Laravel configuration
├── database/
│   ├── migrations/               # Database schema
│   └── seeders/                  # Sample data seeders
├── routes/
│   ├── api.php                   # API routes
│   └── web.php                   # Web routes
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── pages/                # React pages
│   │   ├── components/           # React components
│   │   ├── lib/                  # API and auth logic
│   │   └── styles/               # CSS styles
│   ├── package.json
│   └── vite.config.ts
└── .env                          # Environment configuration
```

## 🔒 Security

- Never commit `.env` file to version control
- Change default passwords in production
- Use strong passwords for all accounts
- Keep dependencies updated regularly

## 📝 License

This project is open-source software.

## 🤝 Support

For issues or questions, refer to the documentation files or check the troubleshooting guide.

---

**Happy Gaming! 🎮**
