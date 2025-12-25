import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { 
  User, 
  Heart,
  Star, 
  Gamepad2, 
  Trophy,
  Award,
  Edit,
  Mail,
  Shield,
  Crown,
  TrendingUp,
  Plus,
  X
} from 'lucide-react';

interface Game {
  id: number;
  title: string;
  genre: string;
  platform: string;
  image_url: string;
  rating: number;
}

interface FavoriteGame {
  id: number;
  game_id: number;
  created_at: string;
  game: Game;
}

interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
}

interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  xp: number;
  level: number;
  joined: string;
}

export function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchAvailableGames();
      fetchAchievements();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const data = await api.getUserFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      toast.error('Failed to load favorite games');
    }
  };

  const fetchAvailableGames = async () => {
    try {
      const response = await api.getAdminGames(1);
      setAvailableGames(response.data || []);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;
    try {
      const response = await api.getUserAchievements(user.id);
      setAchievements(response.achievements || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.getLeaderboard('all-time');
      setLeaderboard(response.top || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const addFavorite = async (gameId: number) => {
    setIsLoading(true);
    try {
      await api.toggleFavoriteGame(gameId, 'add');
      toast.success('Game added to favorites!');
      await fetchFavorites();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add favorite:', error);
      toast.error('Failed to add game to favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (gameId: number) => {
    setIsLoading(true);
    try {
      await api.toggleFavoriteGame(gameId, 'remove');
      toast.success('Game removed from favorites');
      await fetchFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      toast.error('Failed to remove game from favorites');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const favoriteGameIds = favorites.map(f => f.game_id);
  const nonFavoriteGames = availableGames.filter(game => !favoriteGameIds.includes(game.id));
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400';
      case 'Uncommon': return 'text-green-400 border-green-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Legendary': return 'text-orange-400 border-orange-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const stats = [
    { label: 'Achievements', value: `${unlockedCount}/${achievements.length}`, icon: Award, color: 'from-green-500 to-emerald-500' },
    { label: 'Favorite Games', value: `${favorites.length}`, icon: Heart, color: 'from-pink-500 to-rose-500' },
  ];

  const getRoleIcon = () => {
    if (user.role === 'admin') return <Crown className="h-4 w-4 text-yellow-500" />;
    if (user.role === 'moderator') return <Shield className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-[#66c0f4]" />;
  };

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="border-[#2a475e] steam-card overflow-hidden mb-6">
          <div className="relative h-48 bg-gradient-to-r from-[#2a475e] via-[#1e3447] to-[#2a475e]">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1694919123854-24b74b376da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cCUyMGRlc2t8ZW58MXx8fHwxNzYyNjcyODM2fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Profile Banner"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] to-transparent" />
            <Button 
              size="sm"
              className="absolute top-4 right-4 bg-[#2a475e]/80 hover:bg-[#2a475e] text-[#c7d5e0] backdrop-blur-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32 border-4 border-[#16202d] shadow-2xl">
                <AvatarFallback className="bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] text-white text-4xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 mt-4 md:mt-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{user.username}</h1>
                      <Badge className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] text-white border-0 gap-1">
                        {getRoleIcon()}
                        <span className="capitalize">{user.role}</span>
                      </Badge>
                    </div>
                    <p className="text-[#8f98a0] mb-3">Level 42 • Joined March 2024</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-[#8f98a0]">
                        <Mail className="h-4 w-4 text-[#66c0f4]" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/games')}
                    className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Game Library
                  </Button>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#c7d5e0]">Level 42</span>
                    <span className="text-[#8f98a0]">7,850 / 10,000 XP</span>
                  </div>
                  <Progress value={78.5} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-[#2a475e] steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="text-2xl mb-1 text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stat.value}</h3>
                <p className="text-sm text-[#8f98a0]">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Tabs for Achievements, Leaderboard, Favorite Games */}
            <Tabs defaultValue="achievements" className="space-y-4">
              <TabsList className="bg-[#16202d] border border-[#2a475e]">
                <TabsTrigger value="achievements" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
                  <Award className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorite Games
                </TabsTrigger>
              </TabsList>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <Card className="border-[#2a475e] steam-card">
                  <CardHeader>
                    <CardTitle className="text-[#c7d5e0]">Achievements ({unlockedCount}/{achievements.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-r from-[#2a475e]/50 to-[#1e3447]/50 border-[#66c0f4]/30' 
                            : 'bg-[#2a475e]/20 border-[#2a475e] opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`text-4xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <h4 className="text-[#c7d5e0] mb-1">{achievement.name}</h4>
                                <p className="text-sm text-[#8f98a0]">{achievement.description}</p>
                              </div>
                              <Badge variant="outline" className={`${getRarityColor(achievement.rarity)} text-xs`}>
                                {achievement.rarity}
                              </Badge>
                            </div>
                            {achievement.unlocked ? (
                              <p className="text-xs text-[#66c0f4] mt-2">
                                Unlocked • +{achievement.xp_reward} XP
                              </p>
                            ) : (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-[#8f98a0] mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}%</span>
                                </div>
                                <Progress value={achievement.progress} className="h-1.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard">
                <Card className="border-[#2a475e] steam-card">
                  <CardHeader>
                    <CardTitle className="text-[#c7d5e0]">Community Leaderboard</CardTitle>
                    <p className="text-sm text-[#8f98a0]">Top players ranked by XP</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          user && entry.id === user.id
                            ? 'bg-gradient-to-r from-[#66c0f4]/20 to-[#2a75bb]/20 border-[#66c0f4]'
                            : 'bg-[#2a475e]/20 border-[#2a475e] hover:bg-[#2a475e]/40'
                        }`}
                      >
                        <div className="flex items-center justify-center w-12 h-12">
                          {entry.rank === 1 && <Crown className="h-8 w-8 text-yellow-500" />}
                          {entry.rank === 2 && <Award className="h-7 w-7 text-gray-400" />}
                          {entry.rank === 3 && <Award className="h-6 w-6 text-amber-700" />}
                          {entry.rank > 3 && (
                            <span className="text-2xl text-[#8f98a0]" style={{ fontWeight: 700 }}>#{entry.rank}</span>
                          )}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] text-white">
                            {entry.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="text-[#c7d5e0] font-medium">{entry.username}</h4>
                          <p className="text-sm text-[#8f98a0]">Level {entry.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg text-[#66c0f4]" style={{ fontWeight: 700 }}>{entry.xp.toLocaleString()} XP</p>
                          <p className="text-xs text-[#8f98a0]">Joined {entry.joined}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Favorite Games Tab */}
              <TabsContent value="favorites">
                <Card className="border-[#2a475e] steam-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-[#c7d5e0]">Favorite Games ({favorites.length})</CardTitle>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Favorite
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1b2838] border-[#2a475e] max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-[#c7d5e0]">Add Favorite Game</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-3 mt-4">
                          {nonFavoriteGames.length === 0 ? (
                            <p className="text-[#8f98a0] text-center py-8">All games are already in your favorites!</p>
                          ) : (
                            nonFavoriteGames.map((game) => (
                              <div
                                key={game.id}
                                className="flex items-center gap-4 p-3 rounded-lg border border-[#2a475e] bg-[#16202d]/50 hover:bg-[#2a475e]/30 transition-colors"
                              >
                                <img
                                  src={`http://127.0.0.1:8000${game.image_url}`}
                                  alt={game.title}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="text-[#c7d5e0] font-medium">{game.title}</h4>
                                  <p className="text-sm text-[#8f98a0]">{game.genre} • {game.platform}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm text-[#c7d5e0]">{game.rating}/10</span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => addFavorite(game.id)}
                                  disabled={isLoading}
                                  className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {favorites.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-[#2a475e] mx-auto mb-4" />
                        <h3 className="text-xl text-[#c7d5e0] mb-2">No Favorite Games Yet</h3>
                        <p className="text-[#8f98a0] mb-4">Start building your collection of favorite games!</p>
                        <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Favorite
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favorites.map((favorite) => (
                          <div
                            key={favorite.id}
                            className="group relative bg-gradient-to-br from-[#2a475e]/50 to-[#1e3447]/50 rounded-lg border border-[#66c0f4]/30 overflow-hidden hover:border-[#66c0f4] transition-all"
                          >
                            <img
                              src={`http://127.0.0.1:8000${favorite.game.image_url}`}
                              alt={favorite.game.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="text-[#c7d5e0] font-medium mb-1">{favorite.game.title}</h4>
                              <p className="text-sm text-[#8f98a0] mb-2">{favorite.game.genre}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm text-[#c7d5e0]">{favorite.game.rating}/10</span>
                                </div>
                                <Badge variant="outline" className="text-xs text-[#66c0f4] border-[#66c0f4]">
                                  {favorite.game.platform}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              onClick={() => removeFavorite(favorite.game_id)}
                              disabled={isLoading}
                              className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove from favorites"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
