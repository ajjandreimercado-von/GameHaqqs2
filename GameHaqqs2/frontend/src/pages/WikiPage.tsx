import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BookOpen, Search, Book, FileText, HelpCircle, Gamepad2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface WikiEntry {
  id: number;
  title: string;
  category: string;
  content: string;
  image?: string;
  gameId?: number;
}

export function WikiPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const wikiEntries: WikiEntry[] = [
    {
      id: 1,
      title: 'Final Fantasy XVI - Complete Walkthrough',
      category: 'guides',
      content: 'A comprehensive guide covering all main quests, side quests, and optional content in Final Fantasy XVI.',
      image: 'http://127.0.0.1:8000/images/games/Final_Fantasy_XVI.png',
      gameId: 3,
    },
    {
      id: 2,
      title: 'God of War Ragnarök - All Collectibles',
      category: 'guides',
      content: 'Find every collectible in God of War Ragnarök including artifacts, chests, and legendary items.',
      image: 'http://127.0.0.1:8000/images/games/God of War Ragnarok.jpg',
      gameId: 5,
    },
    {
      id: 3,
      title: 'How to Use GameHaqqs2',
      category: 'platform',
      content: 'Learn how to navigate GameHaqqs2, customize your profile, and engage with the community.',
    },
    {
      id: 4,
      title: 'Community Guidelines',
      category: 'platform',
      content: 'Read our community guidelines to understand the rules and best practices for posting content.',
    },
    {
      id: 5,
      title: 'Achievement System Explained',
      category: 'platform',
      content: 'Learn how the achievement system works, how to earn XP, and unlock exclusive badges.',
    },
    {
      id: 6,
      title: 'Ghost of Tsushima - Combat Mastery',
      category: 'guides',
      content: 'Master the art of samurai combat with advanced techniques and strategies.',
      image: 'http://127.0.0.1:8000/images/games/Ghost of Tsushima.jpg',
      gameId: 4,
    },
  ];

  const filteredEntries = wikiEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guides':
        return <Book className="h-5 w-5" />;
      case 'platform':
        return <HelpCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>GameHaqqs Wiki</h1>
              <p className="text-[#8f98a0]">Your source for game guides, walkthroughs, and platform information</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8f98a0]" />
            <Input
              type="text"
              placeholder="Search wiki articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] hover:border-[#66c0f4]/50 focus:border-[#66c0f4]"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="bg-[#16202d] border border-[#2a475e]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <BookOpen className="h-4 w-4 mr-2" />
              All Articles
            </TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <Book className="h-4 w-4 mr-2" />
              Game Guides
            </TabsTrigger>
            <TabsTrigger value="platform" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <HelpCircle className="h-4 w-4 mr-2" />
              Platform Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory}>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#8f98a0] opacity-50" />
                <h3 className="text-xl mb-2 text-[#c7d5e0]">No articles found</h3>
                <p className="text-[#8f98a0]">Try adjusting your search</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="border-[#2a475e] steam-card overflow-hidden group hover:border-[#66c0f4] transition-all cursor-pointer"
                    onClick={() => entry.gameId ? navigate(`/games/${entry.gameId}`) : null}
                  >
                    {entry.image ? (
                      <div className="relative h-40 overflow-hidden">
                        <ImageWithFallback
                          src={entry.image}
                          alt={entry.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] to-transparent" />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-[#2a475e] to-[#1e3447] flex items-center justify-center">
                        {getCategoryIcon(entry.category)}
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-[#c7d5e0] line-clamp-2 group-hover:text-[#66c0f4] transition-colors">
                        {entry.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[#8f98a0] line-clamp-3 mb-4">
                        {entry.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-[#66c0f4]">
                          {getCategoryIcon(entry.category)}
                          <span className="capitalize">{entry.category}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Featured Section */}
        <div className="mt-12">
          <h2 className="text-2xl mb-6 text-[#c7d5e0]" style={{ fontWeight: 700 }}>Quick Links</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-[#2a475e] steam-card hover:border-[#66c0f4] transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg mx-auto mb-3">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm mb-2 text-[#c7d5e0]" style={{ fontWeight: 600 }}>Getting Started</h3>
                <p className="text-xs text-[#8f98a0]">New to GameHaqqs? Start here</p>
              </CardContent>
            </Card>

            <Card className="border-[#2a475e] steam-card hover:border-[#66c0f4] transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg mx-auto mb-3">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm mb-2 text-[#c7d5e0]" style={{ fontWeight: 600 }}>Popular Guides</h3>
                <p className="text-xs text-[#8f98a0]">Most viewed game guides</p>
              </CardContent>
            </Card>

            <Card className="border-[#2a475e] steam-card hover:border-[#66c0f4] transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg mx-auto mb-3">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm mb-2 text-[#c7d5e0]" style={{ fontWeight: 600 }}>FAQ</h3>
                <p className="text-xs text-[#8f98a0]">Frequently asked questions</p>
              </CardContent>
            </Card>

            <Card className="border-[#2a475e] steam-card hover:border-[#66c0f4] transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg mx-auto mb-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm mb-2 text-[#c7d5e0]" style={{ fontWeight: 600 }}>Guidelines</h3>
                <p className="text-xs text-[#8f98a0]">Community rules & policies</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
