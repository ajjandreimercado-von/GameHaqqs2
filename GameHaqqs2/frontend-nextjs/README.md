# GameHaqqs2 - Next.js Frontend

A secure, server-side rendered game database application built with Next.js 15, TypeScript, and Tailwind CSS. Features data from the RAWG Video Games Database API with 897,000+ games.

## 🔒 Security-First Architecture

This application is designed with security as a priority:

- **Server-Side Rendering**: All API calls happen on the server
- **No Client-Side API Keys**: RAWG API key never exposed to browsers
- **Environment Variables**: Sensitive data stored securely in Vercel
- **Server-Only Package**: Enforces server-side execution of API code
- **ISR Caching**: Reduces API calls and improves performance

## ✨ Features

- 🎮 **Massive Game Database**: Access 897,000+ games from RAWG
- 🔍 **Powerful Search**: Find games by name, genre, platform
- 📊 **Detailed Game Info**: Ratings, screenshots, platforms, developers
- ⚡ **Lightning Fast**: ISR caching with 1-hour revalidation
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Built with Tailwind CSS and dark theme

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: RAWG Video Games Database
- **Deployment**: Vercel
- **Security**: server-only package

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- RAWG API key (get free at https://rawg.io/apidocs)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example file
   cp .env.example .env.local
   
   # Edit .env.local and add your RAWG API key
   RAWG_API_KEY=your_api_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

**Required Environment Variable:**
- `RAWG_API_KEY`: Your RAWG API key

## 📦 Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔐 Security Features

All RAWG API calls are made server-side only. The API key is never exposed to the browser.

```typescript
// lib/rawg-server.ts
import 'server-only'; // Prevents browser execution
```

After deployment, verify:
1. **View Page Source**: API key should NOT appear
2. **DevTools Network Tab**: No direct calls to `api.rawg.io`
3. **JavaScript Bundles**: API key should NOT be in client code

## 📚 Documentation

- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Next.js Docs**: https://nextjs.org/docs
- **RAWG API Docs**: https://rawg.io/apidocs
- **Vercel Docs**: https://vercel.com/docs

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
