# Next.js Deployment Guide for GameHaqqs2

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository with your code
- RAWG API key (already configured: 1592a8715bde4d4b954598bf500fee05)

## Deployment Steps

### 1. Push Next.js App to GitHub

```bash
cd c:\laragon\www\GameHaqqs2
git add frontend-nextjs/
git commit -m "Add Next.js app with server-side RAWG API integration"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository `ajjandreimercado-von/GameHaqqs2`
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend-nextjs`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `RAWG_API_KEY` = `1592a8715bde4d4b954598bf500fee05`
   - Select: Production, Preview, and Development

5. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to Next.js directory
cd frontend-nextjs

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: gamehaqqs2
# - Directory: ./ (current directory)
# - Override settings? No

# Add environment variable
vercel env add RAWG_API_KEY production
# Paste: 1592a8715bde4d4b954598bf500fee05

# Deploy to production
vercel --prod
```

### 3. Verify Deployment

After deployment completes:

1. Visit your deployed URL (e.g., `https://gamehaqqs2.vercel.app`)
2. Test the following:
   - ✅ Homepage loads with popular and recent games
   - ✅ Browse to `/games` page
   - ✅ Click on individual game cards to view details
   - ✅ Test search functionality
   - ✅ Open browser DevTools → Network tab
   - ✅ Verify NO requests to `api.rawg.io` from browser (all server-side)
   - ✅ Check that API key never appears in page source or network requests

### 4. Security Verification

**Critical Security Checks:**

```bash
# Check 1: View page source (Ctrl+U)
# Search for "1592a8715bde4d4b954598bf500fee05" - should be 0 results

# Check 2: Open DevTools → Network → Filter by "rawg"
# Should see NO direct requests to api.rawg.io

# Check 3: Check JavaScript bundles
# Search all loaded .js files for API key - should not be found
```

## Architecture Overview

### Server-Side Rendering Flow

```
User Browser Request
    ↓
Vercel Edge Network
    ↓
Next.js Server Component (app/games/page.tsx)
    ↓
Server-Only API Service (lib/rawg-server.ts)
    ↓
RAWG API (with API key from environment)
    ↓
Server renders HTML with data
    ↓
HTML sent to browser (NO API key)
```

### Key Security Features

1. **Server-Only Package**: `import 'server-only'` ensures code never runs in browser
2. **Server Components**: All game data fetching happens on server
3. **Environment Variables**: API key stored in Vercel environment, never in code
4. **ISR Caching**: 
   - Game lists: revalidate every 1 hour (3600s)
   - Individual games: revalidate every 24 hours (86400s)
   - Reduces API calls and improves performance

## File Structure

```
frontend-nextjs/
├── app/
│   ├── page.tsx                 # Home page (Server Component)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── games/
│   │   ├── page.tsx            # Games library (Server Component)
│   │   ├── [id]/
│   │   │   └── page.tsx        # Game detail page (Server Component)
│   │   └── search/
│   │       └── page.tsx        # Search results (Server Component)
├── components/
│   ├── GameCard.tsx            # Game card component
│   └── SearchBar.tsx           # Search bar (Client Component)
├── lib/
│   └── rawg-server.ts          # Server-only RAWG API service
├── .env.local                   # Local environment variables (NOT committed)
├── .env.example                 # Environment template (committed)
├── next.config.ts               # Next.js configuration
└── package.json                 # Dependencies
```

## Environment Variables

### Local Development (.env.local)

```env
RAWG_API_KEY=1592a8715bde4d4b954598bf500fee05
```

### Vercel Production

Set via Vercel dashboard or CLI:
- `RAWG_API_KEY`: Your RAWG API key

## Caching Strategy

| Route | Revalidation | Strategy |
|-------|--------------|----------|
| `/` (Home) | 1 hour | ISR - Popular + Recent games |
| `/games` | 1 hour | ISR - Game library |
| `/games/[id]` | 24 hours | ISR - Individual game details |
| `/games/search` | 30 minutes | ISR - Search results |

## Testing Locally

```bash
cd frontend-nextjs

# Install dependencies (if not already)
npm install

# Run development server
npm run dev

# Open http://localhost:3000
# Test all pages and features
```

## Production Build Test

```bash
# Build for production
npm run build

# Start production server locally
npm start

# Open http://localhost:3000
# Verify production build works correctly
```

## Troubleshooting

### Issue: API Key Not Found

**Symptom**: Error "RAWG_API_KEY is not configured"

**Solution**:
```bash
# Verify environment variable is set in Vercel
vercel env ls

# Add if missing
vercel env add RAWG_API_KEY production
```

### Issue: Images Not Loading

**Symptom**: Game images show broken icon

**Solution**: Verify `next.config.ts` has RAWG domain configured:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'media.rawg.io',
      pathname: '/media/**',
    },
  ],
}
```

### Issue: API Rate Limiting

**Symptom**: Too many requests to RAWG API

**Solution**: ISR caching should prevent this. If it occurs:
- Increase revalidation times in page files
- Consider upgrading RAWG API plan
- Implement additional caching layer (Redis/Vercel KV)

## Monitoring

### Vercel Dashboard

Monitor your deployment:
- **Analytics**: Page views, load times
- **Logs**: Server errors, API calls
- **Deployment**: Build logs, commit history

### Performance Metrics

Expected metrics:
- Time to First Byte (TTFB): < 200ms
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Verify security (no API key exposure)
3. ✅ Test all pages and features
4. 🔄 Monitor performance and errors
5. 🔄 Add custom domain (optional)
6. 🔄 Set up analytics (Vercel Analytics or Google Analytics)
7. 🔄 Consider upgrading RAWG API plan if needed

## Laravel Backend

**Note**: The Laravel backend (`c:\laragon\www\GameHaqqs2`) remains intact and can still be used for:
- User authentication (Sanctum)
- User-generated content (reviews, tips, community posts)
- Database operations
- Admin functionality

The Next.js app handles RAWG API integration independently for security reasons.

## Support

For issues or questions:
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- RAWG API Docs: https://rawg.io/apidocs

---

**Deployment Checklist:**

- [ ] GitHub repository updated with Next.js code
- [ ] Vercel project created and configured
- [ ] Environment variable `RAWG_API_KEY` set in Vercel
- [ ] Root Directory set to `frontend-nextjs`
- [ ] Successful deployment
- [ ] Homepage loads correctly
- [ ] Games library displays data
- [ ] Individual game pages work
- [ ] Search functionality works
- [ ] No API key in browser (DevTools check)
- [ ] No direct RAWG API calls from browser (Network tab check)
- [ ] Performance acceptable (< 3s load time)
