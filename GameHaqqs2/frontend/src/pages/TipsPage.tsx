import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Lightbulb, Search, TrendingUp, Star, Users, Filter, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface Tip {
  id: number;
  game_id: number;
  author_id: number;
  title: string;
  content: string;
  created_at: string;
  game?: {
    id: number;
    title: string;
    image_url: string;
  };
  upvotes?: number;
  views?: number;
}

export function TipsPage() {
  const navigate = useNavigate();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch all tips from an API endpoint
      // For now, we'll use mock data
      setTips([
        {
          id: 1,
          game_id: 3,
          author_id: 1,
          title: 'Master the Combat System',
          content: 'Learn to parry and dodge effectively. Timing is everything in boss fights. Practice against weaker enemies first.',
          created_at: new Date().toISOString(),
          game: {
            id: 3,
            title: 'Final Fantasy XVI',
            image_url: 'http://127.0.0.1:8000/images/games/Final_Fantasy_XVI.png',
          },
          upvotes: 245,
          views: 1820,
        },
        {
          id: 2,
          game_id: 5,
          author_id: 2,
          title: 'Hidden Collectibles Location',
          content: 'Don\'t miss the secret chests in Alfheim. Use your ravens to scout areas thoroughly.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          game: {
            id: 5,
            title: 'God of War Ragnarök',
            image_url: 'http://127.0.0.1:8000/images/games/God of War Ragnarok.jpg',
          },
          upvotes: 189,
          views: 1450,
        },
        {
          id: 3,
          game_id: 4,
          author_id: 3,
          title: 'Perfect Stealth Approach',
          content: 'Use tall grass and rooftops to your advantage. Chain assassinations for maximum efficiency.',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          game: {
            id: 4,
            title: 'Ghost of Tsushima',
            image_url: 'http://127.0.0.1:8000/images/games/Ghost of Tsushima.jpg',
          },
          upvotes: 312,
          views: 2100,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = tips.filter(tip =>
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.game?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTips = () => {
    switch (activeTab) {
      case 'popular':
        return [...filteredTips].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      case 'trending':
        return [...filteredTips].sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return filteredTips;
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>Tips & Tricks</h1>
              <p className="text-[#8f98a0]">Learn from the community's best strategies and insights</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8f98a0]" />
            <Input
              type="text"
              placeholder="Search tips by game, title, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] hover:border-[#66c0f4]/50 focus:border-[#66c0f4]"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#16202d] border border-[#2a475e]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <Lightbulb className="h-4 w-4 mr-2" />
              All Tips
            </TabsTrigger>
            <TabsTrigger value="popular" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <Star className="h-4 w-4 mr-2" />
              Most Popular
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 text-[#66c0f4] animate-spin" />
              </div>
            ) : sortedTips().length === 0 ? (
              <div className="text-center py-16">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 text-[#8f98a0] opacity-50" />
                <h3 className="text-xl mb-2 text-[#c7d5e0]">No tips found</h3>
                <p className="text-[#8f98a0]">Try adjusting your search</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {sortedTips().map((tip) => (
                  <Card
                    key={tip.id}
                    className="border-[#2a475e] steam-card overflow-hidden group hover:border-[#66c0f4] transition-all cursor-pointer"
                    onClick={() => navigate(`/games/${tip.game_id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg flex-shrink-0">
                          <Lightbulb className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1 text-[#c7d5e0] line-clamp-2">
                            {tip.title}
                          </CardTitle>
                          {tip.game && (
                            <Badge
                              variant="outline"
                              className="border-[#66c0f4]/30 text-[#66c0f4] text-xs"
                            >
                              {tip.game.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[#c7d5e0] mb-4 line-clamp-3 leading-relaxed">
                        {tip.content}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-[#2a475e]">
                        <div className="flex items-center gap-4 text-xs text-[#8f98a0]">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{tip.upvotes || 0} upvotes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{tip.views || 0} views</span>
                          </div>
                        </div>
                        <span className="text-xs text-[#8f98a0]">
                          {new Date(tip.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
