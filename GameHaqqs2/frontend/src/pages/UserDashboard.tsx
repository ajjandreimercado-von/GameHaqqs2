import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Trophy, MessageSquare, FileText, TrendingUp, Award, Star, Zap, Target, Crown } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  posts: number;
  comments: number;
  rank: number;
}

export function UserDashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Connected to /api/user
        const data = await api.getUser();
        setUserData(data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate level from XP (100 XP per level)
  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1;
  };

  // Calculate XP needed for next level
  const calculateXPForNextLevel = (currentXP: number) => {
    const currentLevel = calculateLevel(currentXP);
    return currentLevel * 100;
  };

  // Calculate XP progress in current level
  const calculateXPInCurrentLevel = (currentXP: number) => {
    const previousLevelXP = (calculateLevel(currentXP) - 1) * 100;
    return currentXP - previousLevelXP;
  };

  const userXP = userData?.xp || 0;
  const userLevel = calculateLevel(userXP);
  const xpForNextLevel = calculateXPForNextLevel(userXP);
  const xpInCurrentLevel = calculateXPInCurrentLevel(userXP);
  const xpProgress = (xpInCurrentLevel / 100) * 100;

  const leaderboardData = [
    { rank: 1, username: 'ProGamer123', xp: 15420, level: 24, badge: '👑' },
    { rank: 2, username: 'ElitePlayer', xp: 14850, level: 23, badge: '🥈' },
    { rank: 3, username: 'MasterChief', xp: 13990, level: 22, badge: '🥉' },
    { rank: userData?.rank || 42, username: userData?.username || 'You', xp: userData?.xp || 0, level: userData?.level || 1, isUser: true },
  ];

  const achievements = [
    { name: 'First Steps', description: 'Create your account', icon: '🎮', unlocked: true, xp: 50 },
    { name: 'Social Butterfly', description: 'Make 10 comments', icon: '💬', unlocked: true, xp: 100 },
    { name: 'Rising Star', description: 'Reach level 5', icon: '⭐', unlocked: true, xp: 250 },
    { name: 'Top Contributor', description: 'Post 50 times', icon: '📝', unlocked: false, xp: 500 },
    { name: 'Elite Gamer', description: 'Reach level 10', icon: '🏆', unlocked: false, xp: 1000 },
    { name: 'Community Hero', description: '100 helpful comments', icon: '❤️', unlocked: false, xp: 750 },
  ];

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="mb-6">
          <Card className="border-[#2a475e] steam-card overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-[#66c0f4] via-[#2a75bb] to-[#1a5485] relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] to-transparent" />
            </div>
            <CardContent className="relative -mt-16 px-6 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
                <Avatar className="h-24 w-24 border-4 border-[#16202d] shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] text-3xl text-white">
                    {user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl text-[#c7d5e0]">{user?.username}</h2>
                    <Badge className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] text-white border-0">
                      Level {userLevel}
                    </Badge>
                    <Badge variant="outline" className="border-[#66c0f4]/30 text-[#66c0f4]">
                      {userXP} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-[#8f98a0] mb-4">{user?.email}</p>

                  {/* XP Progress Bar */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-[#66c0f4]" />
                        <span className="text-[#c7d5e0]">XP Progress to Level {userLevel + 1}</span>
                      </div>
                      <span className="text-[#66c0f4]">{xpInCurrentLevel} / 100 XP</span>
                    </div>
                    <div className="h-3 bg-[#2a475e] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-[#2a475e] to-[#1e3447] border border-[#2a475e]">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-[#66c0f4]" />
                    <span className="text-sm text-[#8f98a0]">Rank</span>
                  </div>
                  <div className="text-2xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>#{userData?.rank || '-'}</div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-[#2a475e] to-[#1e3447] border border-[#2a475e]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-[#66c0f4]" />
                    <span className="text-sm text-[#8f98a0]">Posts</span>
                  </div>
                  <div className="text-2xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{userData?.posts || 0}</div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-[#2a475e] to-[#1e3447] border border-[#2a475e]">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-[#66c0f4]" />
                    <span className="text-sm text-[#8f98a0]">Comments</span>
                  </div>
                  <div className="text-2xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{userData?.comments || 0}</div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-[#2a475e] to-[#1e3447] border border-[#2a475e]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-[#66c0f4]" />
                    <span className="text-sm text-[#8f98a0]">Total XP</span>
                  </div>
                  <div className="text-2xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{userData?.xp || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList className="bg-[#16202d] border border-[#2a475e]">
            <TabsTrigger value="achievements" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              Recent Activity
            </TabsTrigger>
          </TabsList>

          {/* Achievements */}
          <TabsContent value="achievements" className="space-y-4">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <CardTitle className="text-[#c7d5e0] flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#66c0f4]" />
                  Your Achievements
                </CardTitle>
                <CardDescription className="text-[#8f98a0]">
                  Unlock badges and earn XP by completing challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border transition-all ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-[#2a475e] to-[#1e3447] border-[#66c0f4]/30 steam-card' 
                          : 'bg-[#16202d]/50 border-[#2a475e] opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-14 w-14 rounded-lg flex items-center justify-center text-2xl ${
                          achievement.unlocked 
                            ? 'bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] shadow-lg' 
                            : 'bg-[#2a475e]'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[#c7d5e0]">{achievement.name}</h4>
                            {achievement.unlocked && (
                              <Badge className="bg-[#66c0f4]/20 text-[#66c0f4] border-0 text-xs">
                                +{achievement.xp} XP
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#8f98a0]">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <CardTitle className="text-[#c7d5e0] flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#66c0f4]" />
                  Community Leaderboard
                </CardTitle>
                <CardDescription className="text-[#8f98a0]">Top players ranked by XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((player) => (
                    <div 
                      key={player.rank} 
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                        player.isUser 
                          ? 'bg-gradient-to-r from-[#66c0f4]/20 to-transparent border border-[#66c0f4]/30' 
                          : 'bg-[#2a475e]/30 hover:bg-[#2a475e]/50'
                      }`}
                    >
                      <div className="w-12 text-center">
                        {player.rank <= 3 ? (
                          <span className="text-2xl">{player.badge}</span>
                        ) : (
                          <span className="text-[#8f98a0]">#{player.rank}</span>
                        )}
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-[#2a475e]">
                        <AvatarFallback className="bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] text-white">
                          {player.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[#c7d5e0]">{player.username}</span>
                          {player.isUser && <Badge variant="outline" className="text-xs border-[#66c0f4] text-[#66c0f4]">You</Badge>}
                        </div>
                        <p className="text-sm text-[#8f98a0]">Level {player.level}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[#66c0f4]" style={{ fontWeight: 600 }}>{player.xp.toLocaleString()} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <CardTitle className="text-[#c7d5e0]">Recent Activity</CardTitle>
                <CardDescription className="text-[#8f98a0]">
                  Your recent gaming activity and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <Zap className="h-5 w-5" />, text: 'Earned 50 XP for posting a new comment', time: '1 hour ago', xp: 50 },
                  { icon: <Trophy className="h-5 w-5" />, text: 'Unlocked "Social Butterfly" achievement', time: '3 hours ago', xp: 100 },
                  { icon: <Star className="h-5 w-5" />, text: 'Reached Level 5', time: '1 day ago', xp: 250 },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#2a475e]/30 hover:bg-[#2a475e]/50 transition-all">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center text-white">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#c7d5e0]">{activity.text}</p>
                      <p className="text-xs text-[#8f98a0]">{activity.time}</p>
                    </div>
                    <Badge className="bg-[#66c0f4]/20 text-[#66c0f4] border-0">
                      +{activity.xp}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
