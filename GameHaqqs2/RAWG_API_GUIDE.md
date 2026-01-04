# RAWG API Integration Guide

## 🎮 Overview

Your GameHaqqs2 application now integrates with the **RAWG Video Games Database API** to fetch real game data from a massive database of 800,000+ games.

### Features Implemented:
- ✅ Server-side API calls (API key hidden from frontend)
- ✅ Automatic caching (1 hour for lists, 24 hours for individual games)
- ✅ Search games by title
- ✅ Browse by genre, platform, release date
- ✅ Get popular, recent, and upcoming games
- ✅ Import games to your local database
- ✅ Secure environment variable storage

---

## 🚀 Quick Start

### 1. Start Your Laravel Server
```bash
cd c:\laragon\www\GameHaqqs2
php artisan serve
```

### 2. Test the API Endpoints

**Get Popular Games:**
```bash
GET http://127.0.0.1:8000/api/rawg/popular
```

**Search for a Game:**
```bash
GET http://127.0.0.1:8000/api/rawg/search?q=witcher
```

**Get Game Details:**
```bash
GET http://127.0.0.1:8000/api/rawg/games/3328
# 3328 is the RAWG ID for The Witcher 3
```

---

## 📡 Available API Endpoints

### Public Endpoints (No Authentication Required)

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/api/rawg/games` | GET | Browse games with filters | `?page=1&page_size=20&ordering=-rating` |
| `/api/rawg/games/{id}` | GET | Get single game details | `/api/rawg/games/3328` |
| `/api/rawg/games/{id}/screenshots` | GET | Get game screenshots | `/api/rawg/games/3328/screenshots` |
| `/api/rawg/search` | GET | Search games by title | `?q=cyberpunk&page=1` |
| `/api/rawg/popular` | GET | Get highly rated games | `?limit=20` |
| `/api/rawg/recent` | GET | Get recently released | `?limit=20` |
| `/api/rawg/upcoming` | GET | Get upcoming releases | `?limit=20` |
| `/api/rawg/genre/{genre}` | GET | Get games by genre | `/api/rawg/genre/action?page=1` |

### Protected Endpoints (Require Authentication)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rawg/import` | POST | Import a game to local database |
| `/api/rawg/sync-popular` | POST | Bulk import popular games |

---

## 💻 Frontend Usage Examples

### Basic Usage in React Components

```typescript
import { rawgApi } from '@/lib/api';

// Get popular games
const PopularGames = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    rawgApi.getPopularGames(20).then(data => {
      setGames(data.results);
    });
  }, []);

  return (
    <div>
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};
```

### Search Functionality

```typescript
const SearchGames = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await rawgApi.searchGames(query);
    setResults(data.results);
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      {results.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};
```

### Get Game Details

```typescript
const GameDetailPage = ({ gameId }: { gameId: number }) => {
  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);

  useEffect(() => {
    // Get game details
    rawgApi.getGameById(gameId).then(setGame);
    
    // Get screenshots
    rawgApi.getGameScreenshots(gameId).then(data => {
      setScreenshots(data.results);
    });
  }, [gameId]);

  return (
    <div>
      <h1>{game?.name}</h1>
      <img src={game?.background_image} alt={game?.name} />
      <p>{game?.description_raw}</p>
      
      <div className="screenshots">
        {screenshots.map(ss => (
          <img key={ss.id} src={ss.image} />
        ))}
      </div>
    </div>
  );
};
```

### Import Game to Database (Requires Auth)

```typescript
const ImportButton = ({ rawgId }: { rawgId: number }) => {
  const handleImport = async () => {
    try {
      const result = await rawgApi.importGame(rawgId);
      console.log('Game imported:', result.game);
      alert('Game imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return <button onClick={handleImport}>Import to Database</button>;
};
```

---

## 🔍 Query Parameters

### Browse Games (`/api/rawg/games`)

```javascript
{
  page: 1,              // Page number
  page_size: 20,        // Results per page (max 40)
  search: 'witcher',    // Search query
  genres: 'action',     // Genre slug (action, rpg, strategy, etc.)
  platforms: '4',       // Platform ID (4=PC, 1=Xbox, 2=PlayStation)
  ordering: '-rating',  // Sort order (-rating, -released, name, etc.)
  dates: '2024-01-01,2024-12-31' // Date range
}
```

**Example:**
```
GET /api/rawg/games?search=witcher&platforms=4&ordering=-rating&page_size=10
```

---

## 🎨 Response Format

### Games List Response

```json
{
  "count": 850000,
  "next": "https://api.rawg.io/api/games?page=2",
  "previous": null,
  "results": [
    {
      "id": 3328,
      "name": "The Witcher 3: Wild Hunt",
      "slug": "the-witcher-3-wild-hunt",
      "background_image": "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
      "rating": 4.66,
      "released": "2015-05-18",
      "genres": [
        { "id": 4, "name": "Action", "slug": "action" },
        { "id": 5, "name": "RPG", "slug": "role-playing-games-rpg" }
      ],
      "platforms": [
        { "platform": { "id": 4, "name": "PC" } },
        { "platform": { "id": 1, "name": "Xbox One" } }
      ]
    }
  ]
}
```

### Single Game Response

```json
{
  "id": 3328,
  "name": "The Witcher 3: Wild Hunt",
  "description": "Full HTML description...",
  "description_raw": "Plain text description...",
  "released": "2015-05-18",
  "background_image": "https://...",
  "rating": 4.66,
  "metacritic": 92,
  "playtime": 46,
  "developers": [
    { "id": 9023, "name": "CD PROJEKT RED" }
  ],
  "genres": [...],
  "platforms": [...],
  "screenshots_count": 37
}
```

---

## 🗃️ Database Schema

When you import games, they're saved with these fields:

```sql
games
  - id (primary key)
  - rawg_id (unique, nullable) - RAWG API ID
  - title
  - genre
  - release_date
  - developer
  - description (text)
  - platform
  - image_url
  - rating (decimal)
  - external_data (JSON) - Additional metadata from RAWG
  - created_at
  - updated_at
```

---

## ⚡ Caching Strategy

To improve performance and respect API rate limits:

| Resource | Cache Duration |
|----------|----------------|
| Games lists (browse, search) | 1 hour |
| Single game details | 24 hours |
| Screenshots | 24 hours |

**Clear cache programmatically:**
```php
// In Laravel controller
$this->rawgApi->clearCache($gameId); // Clear specific game
$this->rawgApi->clearCache();        // Clear all cache
```

---

## 🔐 Security Best Practices

✅ **API Key Storage:**
- Stored in `.env` file (never committed to git)
- `.env.example` has placeholder
- Access via `config('services.rawg.api_key')`

✅ **Server-Side Only:**
- Frontend never sees API key
- All requests go through Laravel backend
- Rate limiting handled server-side

✅ **Authentication:**
- Import/sync endpoints require user authentication
- Uses Laravel Sanctum tokens

---

## 📊 Popular Genre Slugs

Use these in the `genres` parameter:

- `action` - Action games
- `indie` - Indie games
- `adventure` - Adventure games
- `role-playing-games-rpg` - RPG games
- `strategy` - Strategy games
- `shooter` - Shooter games
- `casual` - Casual games
- `simulation` - Simulation games
- `puzzle` - Puzzle games
- `arcade` - Arcade games
- `platformer` - Platformer games
- `racing` - Racing games
- `massively-multiplayer` - MMO games
- `sports` - Sports games
- `fighting` - Fighting games
- `family` - Family games
- `board-games` - Board games
- `educational` - Educational games
- `card` - Card games

---

## 🧪 Testing in Postman

### 1. Get Popular Games
```
GET http://127.0.0.1:8000/api/rawg/popular?limit=10
```

### 2. Search for Games
```
GET http://127.0.0.1:8000/api/rawg/search?q=zelda
```

### 3. Get Game by ID
```
GET http://127.0.0.1:8000/api/rawg/games/22509
```

### 4. Import Game (Requires Auth)
```
POST http://127.0.0.1:8000/api/rawg/import
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
Body:
{
  "rawg_id": 3328
}
```

---

## 🚀 Deployment Notes

### For Production (Vercel + Backend)

**Frontend (Vercel):**
- Will call your deployed Laravel backend
- Set `VITE_API_URL=https://your-backend.railway.app/api`

**Backend (Railway/Heroku):**
- Add `RAWG_API_KEY` to environment variables
- Ensure `config/services.php` is committed
- Database must have migrations run

---

## 🎯 Next Steps

1. **Update your Games Library page** to use `rawgApi.getPopularGames()`
2. **Add search functionality** using `rawgApi.searchGames()`
3. **Create game detail pages** using `rawgApi.getGameById()`
4. **Import favorite games** to enable reviews/wikis/tips features
5. **Add genre filters** to browse by game type

---

## 📚 API Reference

Full RAWG API documentation: https://rawg.io/apidocs

Need help? The service is fully configured and ready to use! 🎮
