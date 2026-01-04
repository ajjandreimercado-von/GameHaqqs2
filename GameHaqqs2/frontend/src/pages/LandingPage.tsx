import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Gamepad2, Users, Trophy, Zap, Star, TrendingUp, Award, Shield, Sparkles, MessageSquare, Boxes, BookOpen, Eye } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function LandingPage() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();

  const featuredGames = [
    { 
      id: 3,
      title: 'Final Fantasy XVI', 
      players: '8.2K', 
      image: 'http://127.0.0.1:8000/images/games/Final_Fantasy_XVI.png',
      rating: 8.9
    },
    { 
      id: 5,
      title: 'God of War Ragnarök', 
      players: '12.8K', 
      image: 'http://127.0.0.1:8000/images/games/God of War Ragnarok.jpg',
      rating: 9.3
    },
    { 
      id: 4,
      title: 'Ghost of Tsushima', 
      players: '9.4K', 
      image: 'http://127.0.0.1:8000/images/games/Ghost of Tsushima.jpg',
      rating: 9.4
    },
  ];

  return (
    <div className="min-h-screen bg-[#1b2838]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#171a21] border-b border-[#2a475e] sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>
                GameHaqqs<span className="text-[#66c0f4]">2</span>
              </span>
              <span className="text-xs text-[#8f98a0]">Community Platform</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-[#c7d5e0] hover:bg-[#2a475e] hover:text-[#66c0f4]"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white shadow-lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b2838] via-transparent to-[#1b2838]" style={{ zIndex: 1 }} />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1739184523594-564cb9b61126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBmdXR1cmlzdGljJTIwbmVvbnxlbnwxfHx8fDE3NjI2NzkwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Gaming background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a475e]/50 border border-[#66c0f4]/30 mb-6 backdrop-blur-sm">
              <Star className="h-4 w-4 text-[#66c0f4]" />
              <span className="text-[#66c0f4] text-sm">Join 50,000+ Active Gamers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl mb-6 text-[#c7d5e0]" style={{ fontWeight: 700, lineHeight: 1.1 }}>
              Your Ultimate <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66c0f4] via-[#5ab0e0] to-[#2a75bb]">
                Gaming Community
              </span>
            </h1>
            
            <p className="text-xl text-[#8f98a0] mb-10 max-w-2xl mx-auto">
              Connect with players worldwide, track your achievements, compete on leaderboards, and be part of the most vibrant gaming community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white px-8 shadow-lg steam-gradient-hover"
              >
                Join Now - It's Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="border-[#2a475e] bg-[#16202d]/80 hover:bg-[#2a475e] text-[#c7d5e0] backdrop-blur-sm"
              >
                Sign In
              </Button>
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={() => {
                  enterGuestMode();
                  navigate('/games');
                }}
                className="text-[#8f98a0] hover:text-[#66c0f4] hover:bg-[#2a475e]/50 border border-[#2a475e]/50 backdrop-blur-sm"
              >
                <Eye className="h-5 w-5 mr-2" />
                View as Guest
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-[#16202d]/80 border border-[#2a475e] backdrop-blur-sm">
                <div className="text-3xl text-[#66c0f4]" style={{ fontWeight: 700 }}>50K+</div>
                <div className="text-sm text-[#8f98a0]">Active Players</div>
              </div>
              <div className="p-4 rounded-lg bg-[#16202d]/80 border border-[#2a475e] backdrop-blur-sm">
                <div className="text-3xl text-[#66c0f4]" style={{ fontWeight: 700 }}>1.2M</div>
                <div className="text-sm text-[#8f98a0]">Posts Shared</div>
              </div>
              <div className="p-4 rounded-lg bg-[#16202d]/80 border border-[#2a475e] backdrop-blur-sm">
                <div className="text-3xl text-[#66c0f4]" style={{ fontWeight: 700 }}>250+</div>
                <div className="text-sm text-[#8f98a0]">Games Supported</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16 bg-gradient-to-b from-[#1b2838] to-[#16202d]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-8 text-[#c7d5e0]" style={{ fontWeight: 700 }}>Featured Games</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredGames.map((game, index) => (
              <div 
                key={index} 
                className="steam-card rounded-lg overflow-hidden border border-[#2a475e] cursor-pointer group hover:border-[#66c0f4] transition-colors"
                onClick={() => navigate(`/games/${game.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] to-transparent" />
                  <div className="absolute top-3 right-3 bg-[#16202d]/90 px-3 py-1 rounded-lg backdrop-blur-sm border border-[#2a475e]">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-[#c7d5e0]">{game.rating}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-[#c7d5e0] mb-1 font-semibold">{game.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#8f98a0]">
                      <Users className="h-4 w-4" />
                      <span>{game.players} playing now</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-[#16202d] to-[#171a21]">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/games/${game.id}`);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e]"
                    >
                      <Trophy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-[#16202d]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl mb-12 text-center text-[#c7d5e0]" style={{ fontWeight: 700 }}>Why Join GameHaqqs2?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Global Community</h3>
              <p className="text-sm text-[#8f98a0]">
                Connect with millions of gamers from around the world and build lasting friendships.
              </p>
            </div>

            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Competitive Rankings</h3>
              <p className="text-sm text-[#8f98a0]">
                Climb leaderboards, earn ranks, and prove you're the best in your favorite games.
              </p>
            </div>

            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Achievements</h3>
              <p className="text-sm text-[#8f98a0]">
                Unlock exclusive badges, earn XP, and showcase your gaming accomplishments.
              </p>
            </div>

            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Safe & Moderated</h3>
              <p className="text-sm text-[#8f98a0]">
                Enjoy a toxic-free environment with 24/7 moderation and community guidelines.
              </p>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid md:grid-cols-4 gap-6 mt-6">
            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Community Posts</h3>
              <p className="text-sm text-[#8f98a0]">
                Share tips, tricks, and strategies with the community. Learn from the best players.
              </p>
            </div>

            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Favorite Games</h3>
              <p className="text-sm text-[#8f98a0]">
                Curate your personal collection and quick-access your most-played titles.
              </p>
            </div>

            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Boxes className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Game Library</h3>
              <p className="text-sm text-[#8f98a0]">
                Access a vast collection of games with detailed information and reviews.
              </p>
            </div>

            <div className="p-6 rounded-lg steam-card border border-[#2a475e] group hover:border-[#66c0f4] transition-all">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-2 text-[#c7d5e0] font-semibold">Wiki & Guides</h3>
              <p className="text-sm text-[#8f98a0]">
                Comprehensive guides, wikis, and resources for every game in our library.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#171a21] border-t border-[#2a475e]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl mb-4 text-[#c7d5e0]" style={{ fontWeight: 700 }}>Ready to Level Up?</h2>
          <p className="text-xl text-[#8f98a0] mb-8">Join the community and start your gaming journey today.</p>
          <Button 
            size="lg" 
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white px-12 shadow-lg steam-gradient-hover"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#171a21] border-t border-[#2a475e]">
        <div className="container mx-auto px-4 text-center text-sm text-[#8f98a0]">
          <p>© 2025 GameHaqqs2. All rights reserved. Built for gamers, by gamers.</p>
        </div>
      </footer>
    </div>
  );
}
