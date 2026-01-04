import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SignInPrompt } from '../components/SignInPrompt';
import { GuestModeBanner } from '../components/GuestModeBanner';
import { useAuth } from '../lib/auth';
import { ArrowLeft, Users, Star, ThumbsUp, ThumbsDown, Lightbulb, BookOpen, TrendingUp, MessageSquare, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

// Genre color mapping (same as GamesLibrary)
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

interface GameDetailType {
  id: number;
  title: string;
  genre: string;
  platform: string;
  rating: number;
  image_url: string;
  description: string;
  release_date: string;
  developer: string;
}

interface Review {
  id: number;
  game_id: number;
  author_id: number;
  rating: number;
  pros?: string;
  cons?: string;
  content: string;
  created_at: string;
}

interface Tip {
  id: number;
  game_id: number;
  author_id: number;
  title: string;
  content: string;
  created_at: string;
}

export function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [game, setGame] = useState<GameDetailType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [relatedGames, setRelatedGames] = useState<GameDetailType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signInPrompt, setSignInPrompt] = useState({ open: false, action: '' });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 2.5,
    pros: '',
    cons: '',
    content: '',
  });

  // Tip form state
  const [tipForm, setTipForm] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all games and find the one with matching ID
        const response = await api.getAdminGames(1);
        const gameData = response.data.find((g: any) => g.id === parseInt(id || '1'));
        
        if (gameData) {
          setGame(gameData);
          // Fetch reviews and tips for this game
          await fetchReviewsAndTips(gameData.id);
          // Fetch related games by genre
          await fetchRelatedGames(gameData.id, gameData.genre);
        } else {
          setError('Game not found');
        }
      } catch (err) {
        console.error('Failed to fetch game:', err);
        setError('Failed to load game details');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [id]);

  const fetchReviewsAndTips = async (gameId: number) => {
    try {
      const [reviewsResponse, tipsResponse] = await Promise.all([
        api.getGameReviews(gameId),
        api.getGameTips(gameId),
      ]);
      setReviews(reviewsResponse.data || []);
      setTips(tipsResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews/tips:', err);
      // Use empty arrays if fetch fails
      setReviews([]);
      setTips([]);
    }
  };

  const fetchRelatedGames = async (currentGameId: number, genre: string) => {
    try {
      const response = await api.getAdminGames(1, 100);
      if (response && response.data) {
        // Filter games by same genre, exclude current game, limit to 4
        const related = response.data
          .filter((g: any) => 
            g.id !== currentGameId && 
            g.genre?.toLowerCase() === genre?.toLowerCase()
          )
          .slice(0, 4);
        setRelatedGames(related);
      }
    } catch (err) {
      console.error('Failed to fetch related games:', err);
      setRelatedGames([]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      setSignInPrompt({ open: true, action: 'submit reviews' });
      return;
    }
    if (!game) return;

    try {
      setSubmitting(true);
      await api.createGameReview(game.id, reviewForm);
      // Refresh reviews after submission
      await fetchReviewsAndTips(game.id);
      // Reset form and close dialog
      setReviewForm({ rating: 2.5, pros: '', cons: '', content: '' });
      setReviewDialogOpen(false);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      setSignInPrompt({ open: true, action: 'submit tips and tricks' });
      return;
    }
    if (!game) return;

    try {
      setSubmitting(true);
      await api.createGameTip(game.id, tipForm);
      // Refresh tips after submission
      await fetchReviewsAndTips(game.id);
      // Reset form and close dialog
      setTipForm({ title: '', content: '' });
      setTipDialogOpen(false);
    } catch (err) {
      console.error('Failed to submit tip:', err);
      alert('Failed to submit tip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b2838] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#66c0f4] mx-auto mb-4" />
          <p className="text-[#c7d5e0]">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#1b2838] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4 text-[#c7d5e0]">{error || 'Game Not Found'}</h2>
          <Button onClick={() => navigate('/games')} className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb]">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  // Format tags from genre and platform
  const tags = [game.genre, game.platform];

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/games')}
          className="mb-4 text-[#c7d5e0] hover:bg-[#2a475e] hover:text-[#66c0f4] transition-all duration-300 ease-in-out hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Library
        </Button>

        {/* Guest Mode Banner */}
        <GuestModeBanner />

        {/* Game Header */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <Card className="border-[#2a475e] steam-card overflow-hidden hover:shadow-2xl transition-all duration-500 ease-in-out hover:border-[#66c0f4]/30">
              <div className="relative h-96 overflow-hidden group">
                <ImageWithFallback
                  src={
                    game.image_url?.startsWith('http') 
                      ? game.image_url 
                      : `http://127.0.0.1:8000${game.image_url}`
                  }
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] via-transparent to-transparent" />
              </div>
              <CardContent className="p-6 bg-gradient-to-b from-[#16202d] to-[#171a21]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl mb-2 text-[#c7d5e0]" style={{ fontWeight: 700 }}>{game.title}</h1>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-[#66c0f4]/30 text-[#66c0f4] hover:bg-[#66c0f4]/10 hover:border-[#66c0f4] transition-all duration-300 ease-in-out hover:shadow-lg">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{game.rating}</span>
                    </div>
                    <p className="text-sm text-[#8f98a0]">Rating</p>
                  </div>
                </div>

                <p className="text-[#c7d5e0] mb-4 leading-relaxed">{game.description}</p>

                <div className="flex items-center gap-4 text-sm text-[#8f98a0]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#66c0f4]" />
                    <span>Popular Title</span>
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-[#2a475e]" />
                  <span>Released: {new Date(game.release_date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info Sidebar */}
          <div className="space-y-4">
            <Card className="border-[#2a475e] steam-card bg-gradient-to-b from-[#2a475e] to-[#1e3447] hover:shadow-xl transition-all duration-500 ease-in-out hover:border-[#66c0f4]/20">
              <CardHeader>
                <CardTitle className="text-[#c7d5e0]">Game Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#8f98a0] mb-1">Developer</p>
                  <p className="text-[#c7d5e0]">{game.developer}</p>
                </div>
                <Separator className="bg-[#2a475e]" />
                <div>
                  <p className="text-sm text-[#8f98a0] mb-1">Release Date</p>
                  <p className="text-[#c7d5e0]">{new Date(game.release_date).toLocaleDateString()}</p>
                </div>
                <Separator className="bg-[#2a475e]" />
                <div>
                  <p className="text-sm text-[#8f98a0] mb-2">Platform</p>
                  <Badge className="bg-[#66c0f4]/20 text-[#66c0f4] border-0 hover:bg-[#66c0f4]/30 transition-all duration-300 ease-in-out hover:shadow-lg">
                    {game.platform}
                  </Badge>
                </div>
                <Separator className="bg-[#2a475e]" />
                <div>
                  <p className="text-sm text-[#8f98a0] mb-1">Genre</p>
                  <Badge className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] text-white border-0 hover:from-[#5ab0e0] hover:to-[#236ba8] transition-all duration-300 ease-in-out hover:shadow-lg">
                    {game.genre}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* You Might Also Like Section */}
            {relatedGames.length > 0 && (
              <Card className="border-[#2a475e] steam-card bg-gradient-to-b from-[#2a475e] to-[#1e3447] hover:shadow-xl transition-all duration-500 ease-in-out hover:border-[#66c0f4]/20">
                <CardHeader>
                  <CardTitle className="text-[#c7d5e0]">You Might Also Like</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedGames.map((relatedGame) => (
                    <div 
                      key={relatedGame.id}
                      className="flex gap-3 p-2 rounded-lg hover:bg-[#2a475e]/50 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md hover:translate-x-1 group"
                      onClick={() => {
                        navigate(`/games/${relatedGame.id}`);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
                        <ImageWithFallback
                          src={
                            relatedGame.image_url?.startsWith('http') 
                              ? relatedGame.image_url 
                              : `http://127.0.0.1:8000${relatedGame.image_url}`
                          }
                          alt={relatedGame.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-[#c7d5e0] truncate mb-1 group-hover:text-[#66c0f4] transition-colors duration-300">{relatedGame.title}</h4>
                        <Badge 
                          className="text-xs border-0 mb-1 transition-all duration-300 ease-in-out"
                          style={{
                            backgroundColor: getGenreColor(relatedGame.genre).bg,
                            color: getGenreColor(relatedGame.genre).text,
                            borderColor: getGenreColor(relatedGame.genre).border
                          }}
                        >
                          {relatedGame.genre}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-[#c7d5e0]">{relatedGame.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Rating Section - Improved Layout */}
        <Card className="border-[#2a475e] steam-card bg-gradient-to-b from-[#16202d] to-[#171a21] mb-8 mt-8 shadow-lg">
          <CardContent className="px-6 md:px-12 pt-12 pb-12">
            <div className="flex flex-col md:flex-row md:items-center md:gap-16 lg:gap-24">
              {/* LEFT - Rating Summary */}
              <div className="flex flex-col items-center justify-center min-w-[200px] mb-8 md:mb-0">
                <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] mb-3 leading-none" style={{ fontWeight: 900 }}>
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const avgRating = reviews.length > 0 
                      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                      : 0;
                    const isFilled = star <= Math.round(avgRating);
                    return (
                      <Star 
                        key={star}
                        className={`h-4 w-4 transition-all duration-300 ease-in-out ${
                          isFilled
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' 
                            : 'text-[#374a5a] fill-[#374a5a]'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-sm text-[#8f98a0] font-medium">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
              </div>

              {/* RIGHT - Rating Distribution Bars */}
              <div className="flex-1 space-y-3 w-full">
                {[5, 4, 3, 2, 1].map((starRating) => {
                  // Calculate actual percentage based on reviews (0-5 star system)
                  const reviewsWithThisRating = reviews.filter(review => {
                    const reviewStars = Math.round(review.rating);
                    return reviewStars === starRating;
                  }).length;
                  
                  const percentage = reviews.length > 0 
                    ? Math.round((reviewsWithThisRating / reviews.length) * 100)
                    : 0;
                  
                  return (
                    <div key={starRating} className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 w-12">
                        <span className="text-sm text-[#c7d5e0] font-semibold min-w-[8px]">{starRating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-3 bg-[#1e3447] rounded-full overflow-hidden border border-[#2a475e]/30">
                        <div 
                          className="h-full bg-gradient-to-r from-[#66c0f4] via-[#4a9fd8] to-[#2a75bb] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(102,192,244,0.3)]"
                          style={{
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-[#8f98a0] font-medium w-12 text-right tabular-nums">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Reviews, Tips, Wiki */}
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList className="bg-[#16202d] border border-[#2a475e]">
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4] transition-all duration-300 ease-in-out hover:bg-[#2a475e]/50">
              <MessageSquare className="h-4 w-4 mr-2 transition-transform duration-300" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4] transition-all duration-300 ease-in-out hover:bg-[#2a475e]/50">
              <Lightbulb className="h-4 w-4 mr-2 transition-transform duration-300" />
              Tips & Tricks
            </TabsTrigger>
            <TabsTrigger value="wiki" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4] transition-all duration-300 ease-in-out hover:bg-[#2a475e]/50">
              <BookOpen className="h-4 w-4 mr-2 transition-transform duration-300" />
              Wiki
            </TabsTrigger>
          </TabsList>

          {/* Reviews Section */}
          <TabsContent value="reviews">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#c7d5e0]">Player Reviews ({reviews.length})</CardTitle>
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                        disabled={isGuest}
                        onClick={(e) => {
                          if (isGuest) {
                            e.preventDefault();
                            setSignInPrompt({ open: true, action: 'write reviews' });
                          }
                        }}
                      >
                        Write a Review {isGuest && '(Sign in required)'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1b2838] border-[#2a475e] text-[#c7d5e0]">
                      <DialogHeader>
                        <DialogTitle className="text-[#c7d5e0]">Write Your Review</DialogTitle>
                        <DialogDescription className="text-[#8f98a0]">
                          Share your thoughts about {game.title}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <Label htmlFor="rating" className="text-[#c7d5e0]">Rating (1-5 stars)</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              id="rating"
                              type="number"
                              min="0"
                              max="5"
                              step="0.5"
                              value={reviewForm.rating}
                              onChange={(e) => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
                              className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] transition-all duration-300 ease-in-out focus:border-[#66c0f4] focus:ring-2 focus:ring-[#66c0f4]/20"
                              required
                            />
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 ${
                                    star <= Math.round(reviewForm.rating)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-[#374a5a] fill-[#374a5a]'
                                  }`}
                                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="pros" className="text-[#c7d5e0]">Pros (Optional)</Label>
                          <Input
                            id="pros"
                            value={reviewForm.pros}
                            onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] transition-all duration-300 ease-in-out focus:border-[#66c0f4] focus:ring-2 focus:ring-[#66c0f4]/20"
                            placeholder="What did you like?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cons" className="text-[#c7d5e0]">Cons (Optional)</Label>
                          <Input
                            id="cons"
                            value={reviewForm.cons}
                            onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] transition-all duration-300 ease-in-out focus:border-[#66c0f4] focus:ring-2 focus:ring-[#66c0f4]/20"
                            placeholder="What could be improved?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="content" className="text-[#c7d5e0]">Review Content</Label>
                          <Textarea
                            id="content"
                            value={reviewForm.content}
                            onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] min-h-[120px] transition-all duration-300 ease-in-out focus:border-[#66c0f4] focus:ring-2 focus:ring-[#66c0f4]/20"
                            placeholder="Write your detailed review..."
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setReviewDialogOpen(false)} className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] transition-all duration-300 ease-in-out hover:shadow-md">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Submitting...' : 'Submit Review'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-[#8f98a0]">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No reviews yet. Be the first to review this game!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-lg bg-[#2a475e]/30 border border-[#2a475e] hover:bg-[#2a475e]/50 transition-all duration-300 ease-in-out hover:shadow-lg hover:border-[#66c0f4]/20">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] text-white">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="text-[#c7d5e0]">{review.author || `User #${review.author_id}`}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= Math.round(review.rating)
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-[#374a5a] fill-[#374a5a]'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-[#c7d5e0] ml-1">{review.rating.toFixed(1)}/5</span>
                                </div>
                                <span className="text-xs text-[#8f98a0]">{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          {review.pros && (
                            <div className="mb-2">
                              <span className="text-xs text-green-400 font-semibold">Pros:</span>
                              <p className="text-sm text-[#c7d5e0]">{review.pros}</p>
                            </div>
                          )}
                          {review.cons && (
                            <div className="mb-2">
                              <span className="text-xs text-red-400 font-semibold">Cons:</span>
                              <p className="text-sm text-[#c7d5e0]">{review.cons}</p>
                            </div>
                          )}
                          <p className="text-sm text-[#c7d5e0] mb-3">{review.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips & Tricks Section */}
          <TabsContent value="tips">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#c7d5e0]">Tips & Tricks ({tips.length})</CardTitle>
                  <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
                        disabled={isGuest}
                        onClick={(e) => {
                          if (isGuest) {
                            e.preventDefault();
                            setSignInPrompt({ open: true, action: 'share tips' });
                          }
                        }}
                      >
                        Share a Tip {isGuest && '(Sign in required)'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1b2838] border-[#2a475e] text-[#c7d5e0]">
                      <DialogHeader>
                        <DialogTitle className="text-[#c7d5e0]">Share Your Tip</DialogTitle>
                        <DialogDescription className="text-[#8f98a0]">
                          Help other players with your tips for {game.title}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitTip} className="space-y-4">
                        <div>
                          <Label htmlFor="tipTitle" className="text-[#c7d5e0]">Title</Label>
                          <Input
                            id="tipTitle"
                            value={tipForm.title}
                            onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] transition-all duration-300 ease-in-out focus:border-[#66c0f4] focus:ring-2 focus:ring-[#66c0f4]/20"
                            placeholder="Give your tip a catchy title"
                            required
                            maxLength={100}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tipContent" className="text-[#c7d5e0]">Tip Content</Label>
                          <Textarea
                            id="tipContent"
                            value={tipForm.content}
                            onChange={(e) => setTipForm({ ...tipForm, content: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] min-h-[120px] transition-all duration-300 ease-in-out focus:border-[#66c0f4] focus:ring-2 focus:ring-[#66c0f4]/20"
                            placeholder="Share your detailed tip or strategy..."
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setTipDialogOpen(false)} className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] transition-all duration-300 ease-in-out hover:shadow-md">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Submitting...' : 'Share Tip'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tips.length === 0 ? (
                  <div className="text-center py-8 text-[#8f98a0]">
                    <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tips yet. Be the first to share a helpful tip!</p>
                  </div>
                ) : (
                  tips.map((tip) => (
                    <div key={tip.id} className="p-5 rounded-lg bg-gradient-to-br from-[#2a475e]/50 to-[#1e3447]/50 border border-[#2a475e] hover:from-[#2a475e]/70 hover:to-[#1e3447]/70 transition-all duration-300 ease-in-out hover:shadow-lg hover:border-[#66c0f4]/20 hover:scale-[1.01]">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-110">
                          <Lightbulb className="h-6 w-6 text-white transition-transform duration-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg mb-1 text-[#c7d5e0]" style={{ fontWeight: 600 }}>{tip.title}</h3>
                              <p className="text-sm text-[#8f98a0]">by {tip.author || `User #${tip.author_id}`} • {new Date(tip.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className="text-sm text-[#c7d5e0] leading-relaxed">{tip.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wiki Section */}
          <TabsContent value="wiki">
            <Card className="border-[#2a475e] steam-card">
              <CardHeader>
                <CardTitle className="text-[#c7d5e0]">Wiki</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Game Overview */}
                <div className="p-5 rounded-lg bg-[#2a475e]/30 border border-[#2a475e] hover:bg-[#2a475e]/40 transition-all duration-300 ease-in-out hover:shadow-lg hover:border-[#66c0f4]/20">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-110">
                      <BookOpen className="h-5 w-5 text-white transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-3 text-[#c7d5e0]" style={{ fontWeight: 600 }}>Overview</h3>
                      <p className="text-sm text-[#c7d5e0] leading-relaxed">{game.description}</p>
                    </div>
                  </div>
                </div>

                {/* Game Details */}
                <div className="p-5 rounded-lg bg-[#2a475e]/30 border border-[#2a475e] hover:bg-[#2a475e]/40 transition-all duration-300 ease-in-out hover:shadow-lg hover:border-[#66c0f4]/20">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-110">
                      <TrendingUp className="h-5 w-5 text-white transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-3 text-[#c7d5e0]" style={{ fontWeight: 600 }}>Details</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-[#8f98a0] mb-1">Developer</p>
                          <p className="text-sm text-[#c7d5e0]">{game.developer}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8f98a0] mb-1">Genre</p>
                          <p className="text-sm text-[#c7d5e0]">{game.genre}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8f98a0] mb-1">Platform</p>
                          <p className="text-sm text-[#c7d5e0]">{game.platform}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8f98a0] mb-1">Release Date</p>
                          <p className="text-sm text-[#c7d5e0]">{new Date(game.release_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8f98a0] mb-1">Rating</p>
                          <p className="text-sm text-[#c7d5e0]">{game.rating}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
