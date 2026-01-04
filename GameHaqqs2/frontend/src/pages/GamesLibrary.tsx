import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CommunityPosts } from '../components/CommunityPosts';
import { GuestModeBanner } from '../components/GuestModeBanner';
import { SignInPrompt } from '../components/SignInPrompt';
import { useAuth } from '../lib/auth';
import { Search, Users, Star, Flame, TrendingUp, Filter, MessageSquare, Loader2, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { api } from '../lib/api';

interface Game {
  id: number;
  title: string;
  genre: string;
  category?: string;
  players?: string;
  rating: number;
  image_url: string;
  description: string;
  platform: string;
  release_date: string;
  developer: string;
  trending?: boolean;
  tags?: string[];
}

// Genre color mapping
const getGenreColor = (genre: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'action': { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: 'rgba(239, 68, 68, 0.5)' },
    'racing': { bg: 'rgba(249, 115, 22, 0.2)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.5)' },
    'adventure': { bg: 'rgba(34, 197, 94, 0.2)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.5)' },
    'rpg': { bg: 'rgba(236, 72, 153, 0.2)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.5)' },
    'shooter': { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: 'rgba(16, 185, 129, 0.5)' },
    'sports': { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.5)' },
    'strategy': { bg: 'rgba(217, 70, 239, 0.2)', text: '#e879f9', border: 'rgba(217, 70, 239, 0.5)' },
    'moba': { bg: 'rgba(99, 102, 241, 0.2)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.5)' },
    'simulation': { bg: 'rgba(6, 182, 212, 0.2)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.5)' },
    'horror': { bg: 'rgba(168, 85, 247, 0.2)', text: '#a78bfa', border: 'rgba(168, 85, 247, 0.5)' },
  };
  const normalizedGenre = genre?.toLowerCase() || '';
  return colors[normalizedGenre] || { bg: 'rgba(42, 71, 94, 0.3)', text: '#8f98a0', border: '#2a475e' };
};

export function GamesLibrary() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mainTab, setMainTab] = useState('games');
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteGameIds, setFavoriteGameIds] = useState<Set<number>>(new Set());
  const [favoritingGame, setFavoritingGame] = useState<number | null>(null);
  const [signInPrompt, setSignInPrompt] = useState({ open: false, action: '' });
  const gamesPerPage = 8;

  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const userId = parseInt(localStorage.getItem('user_id') || '0');
        if (userId > 0) {
          const response = await api.getUserFavorites(userId);
          const favoriteIds = new Set((response as any[]).map((fav: any) => fav.game_id));
          setFavoriteGameIds(favoriteIds);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await api.getAdminGames(1, 100);
        
        if (response && response.data) {
          // Transform API response to Game interface
          const transformedGames = response.data.map((game: any) => ({
            ...game,
            category: game.genre,
            image: game.image_url?.startsWith('http') ? game.image_url : `http://127.0.0.1:8000${game.image_url}`,
            players: `${Math.floor(Math.random() * 20) + 5}K`,
            trending: Math.random() > 0.4,
            tags: [game.genre, game.platform?.split(',')[0]?.trim() || 'Gaming'].filter(Boolean)
          }));
          
          setGames(transformedGames);
        }
      } catch (error) {
        console.error('Failed to fetch games:', error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = activeCategory === 'all' || game.genre?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const trendingGames = games.filter(game => game.trending).slice(0, 4);

  const handleToggleFavorite = async (gameId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to game detail
    
    if (isGuest) {
      setSignInPrompt({ open: true, action: 'favorite games' });
      return;
    }
    
    try {
      setFavoritingGame(gameId);
      const action = favoriteGameIds.has(gameId) ? 'remove' : 'add';
      await api.toggleFavoriteGame(gameId, action);
      
      // Update local state
      setFavoriteGameIds(prev => {
        const newSet = new Set(prev);
        if (action === 'add') {
          newSet.add(gameId);
        } else {
          newSet.delete(gameId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setFavoritingGame(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Guest Mode Banner */}
        <GuestModeBanner />
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 text-[#c7d5e0]" style={{ fontWeight: 700 }}>Game Library</h1>
          <p className="text-[#8f98a0]">Discover and play amazing games from our collection</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="bg-[#16202d] border border-[#2a475e]">
            <TabsTrigger value="games" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <Flame className="h-4 w-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Community Posts
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            {/* Search Bar */}
            <div>
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8f98a0]" />
                <Input
                  type="text"
                  placeholder="Search games, tags, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] hover:border-[#66c0f4]/50 focus:border-[#66c0f4]"
                />
              </div>
            </div>

            {/* Trending Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="text-2xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>Trending Now</h2>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 text-[#66c0f4] animate-spin" />
                </div>
              ) : (
                <div className="grid md:grid-cols-4 gap-4">
                  {trendingGames.map((game) => (
                    <Card 
                      key={game.id} 
                      className="border-[#2a475e] steam-card overflow-hidden group cursor-pointer"
                      onClick={() => navigate(`/games/${game.id}`)}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <ImageWithFallback
                          src={game.image_url?.startsWith('http') ? game.image_url : `http://127.0.0.1:8000${game.image_url}`}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] to-transparent" />
                        <Badge className="absolute top-2 right-2 bg-orange-500 text-white border-0">
                          <Flame className="h-3 w-3 mr-1" />
                          Hot
                        </Badge>
                      </div>
                      <CardContent className="p-3 bg-gradient-to-b from-[#16202d] to-[#171a21]">
                        <h3 className="text-sm mb-1 text-[#c7d5e0] truncate">{game.title}</h3>
                        <div className="flex items-center justify-between text-xs text-[#8f98a0]">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{game.players}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span>{game.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
              <TabsList className="bg-[#16202d] border border-[#2a475e]">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
                  All Games
                </TabsTrigger>
                <TabsTrigger value="action" style={{ backgroundColor: activeCategory === 'action' ? '#ef4444' : undefined, color: activeCategory === 'action' ? 'white' : undefined }}>
                  Action
                </TabsTrigger>
                <TabsTrigger value="adventure" style={{ backgroundColor: activeCategory === 'adventure' ? '#22c55e' : undefined, color: activeCategory === 'adventure' ? 'white' : undefined }}>
                  Adventure
                </TabsTrigger>
                <TabsTrigger value="horror" style={{ backgroundColor: activeCategory === 'horror' ? '#a855f7' : undefined, color: activeCategory === 'horror' ? 'white' : undefined }}>
                  Horror
                </TabsTrigger>
                <TabsTrigger value="moba" style={{ backgroundColor: activeCategory === 'moba' ? '#6366f1' : undefined, color: activeCategory === 'moba' ? 'white' : undefined }}>
                  MOBA
                </TabsTrigger>
                <TabsTrigger value="racing" style={{ backgroundColor: activeCategory === 'racing' ? '#f97316' : undefined, color: activeCategory === 'racing' ? 'white' : undefined }}>
                  Racing
                </TabsTrigger>
                <TabsTrigger value="rpg" style={{ backgroundColor: activeCategory === 'rpg' ? '#ec4899' : undefined, color: activeCategory === 'rpg' ? 'white' : undefined }}>
                  RPG
                </TabsTrigger>
                <TabsTrigger value="shooter" style={{ backgroundColor: activeCategory === 'shooter' ? '#10b981' : undefined, color: activeCategory === 'shooter' ? 'white' : undefined }}>
                  Shooter
                </TabsTrigger>
                <TabsTrigger value="simulation" style={{ backgroundColor: activeCategory === 'simulation' ? '#06b6d4' : undefined, color: activeCategory === 'simulation' ? 'white' : undefined }}>
                  Simulation
                </TabsTrigger>
                <TabsTrigger value="sports" style={{ backgroundColor: activeCategory === 'sports' ? '#3b82f6' : undefined, color: activeCategory === 'sports' ? 'white' : undefined }}>
                  Sports
                </TabsTrigger>
                <TabsTrigger value="strategy" style={{ backgroundColor: activeCategory === 'strategy' ? '#d946ef' : undefined, color: activeCategory === 'strategy' ? 'white' : undefined }}>
                  Strategy
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeCategory}>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 text-[#66c0f4] animate-spin" />
                  </div>
                ) : filteredGames.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 rounded-full bg-[#2a475e] flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-[#8f98a0]" />
                    </div>
                    <h3 className="text-xl mb-2 text-[#c7d5e0]">No games found</h3>
                    <p className="text-[#8f98a0]">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {currentGames.map((game) => (
                      <Card key={game.id} className="border-[#2a475e] steam-card overflow-hidden group cursor-pointer flex flex-col h-full">
                        <div className="relative h-48 overflow-hidden flex-shrink-0" onClick={() => navigate(`/games/${game.id}`)}>
                          <ImageWithFallback
                            src={game.image_url?.startsWith('http') ? game.image_url : `http://127.0.0.1:8000${game.image_url}`}
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          </div>
                          {game.trending && (
                            <Badge className="absolute top-2 right-2 bg-orange-500 text-white border-0">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          {/* Favorite Heart Button */}
                          <button
                            onClick={(e) => handleToggleFavorite(game.id, e)}
                            disabled={favoritingGame === game.id}
                            className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title={favoriteGameIds.has(game.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart 
                              className={`h-4 w-4 transition-colors ${
                                favoriteGameIds.has(game.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        </div>
                        <CardContent className="p-5 bg-gradient-to-b from-[#16202d] to-[#171a21] flex flex-col flex-1">
                          <div className="flex-1">
                            <h3 className="mb-2 text-[#c7d5e0] truncate font-medium">{game.title}</h3>
                            <p className="text-xs text-[#8f98a0] mb-4 line-clamp-3 leading-relaxed">{game.description}</p>
                          </div>
                          
                          <div className="mt-auto space-y-3">
                            <div className="flex items-center justify-between text-sm text-[#8f98a0]">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{game.players}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span>{game.rating}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {game.genre && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{
                                    backgroundColor: getGenreColor(game.genre).bg,
                                    color: getGenreColor(game.genre).text,
                                    borderColor: getGenreColor(game.genre).border
                                  }}
                                >
                                  {game.genre}
                                </Badge>
                              )}
                              {game.tags && game.tags.slice(0, 1).map((tag, index) => (
                                tag !== game.genre && (
                                  <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className="text-xs border-[#2a475e] text-[#8f98a0] bg-[#2a475e]/30"
                                  >
                                    {tag}
                                  </Badge>
                                )
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-16">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="border-[#2a475e] bg-[#16202d] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-30 disabled:cursor-not-allowed h-9 px-3"
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" />
                          Previous
                        </Button>
                        
                        <div className="flex gap-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page 
                                ? "bg-[#66c0f4] text-white hover:bg-[#4a9fd8] w-9 h-9 p-0 border-0 font-medium" 
                                : "border-[#2a475e] bg-[#16202d] text-[#c7d5e0] hover:bg-[#2a475e] w-9 h-9 p-0 font-medium"}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="border-[#2a475e] bg-[#16202d] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-30 disabled:cursor-not-allowed h-9 px-3"
                        >
                          Next
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Community Posts Tab */}
          <TabsContent value="community">
            <CommunityPosts />
          </TabsContent>
        </Tabs>

        {/* Sign In Prompt */}
        <SignInPrompt
          open={signInPrompt.open}
          onOpenChange={(open) => setSignInPrompt({ ...signInPrompt, open })}
          action={signInPrompt.action}
        />
      </div>
    </div>
  );
}
