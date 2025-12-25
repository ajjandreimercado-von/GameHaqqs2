import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
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
  const [game, setGame] = useState<GameDetailType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [relatedGames, setRelatedGames] = useState<GameDetailType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
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
    if (!game) return;

    try {
      setSubmitting(true);
      await api.createGameReview(game.id, reviewForm);
      // Refresh reviews after submission
      await fetchReviewsAndTips(game.id);
      // Reset form and close dialog
      setReviewForm({ rating: 5, pros: '', cons: '', content: '' });
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
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] via-[#1b2838] to-[#16202d]">
      {/* Back Button - Above everything */}
      <div className="container mx-auto px-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/games')}
          className="mb-2 text-[#c7d5e0] hover:bg-[#2a475e]/50 hover:text-[#66c0f4]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
      </div>

      {/* Hero Banner Section - Full width, dominant */}
      <div className="relative w-full h-[500px] mb-6">
        <ImageWithFallback
          src={
            game.image_url?.startsWith('http') 
              ? game.image_url 
              : `http://127.0.0.1:8000${game.image_url}`
          }
          alt={game.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] via-[#16202d]/60 to-transparent" />
        
        {/* Trending Badge - Top Right */}
        <div className="absolute top-6 right-6">
          <Badge className="bg-[#f77523] text-white px-4 py-2 text-sm font-semibold border-0 shadow-lg">
            Trending
          </Badge>
        </div>

        {/* Game Title - Bottom Left */}
        <div className="absolute bottom-8 left-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-[#f4d35e] text-black px-3 py-1 text-xs font-bold border-0">
              {game.genre}
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-white mb-1 drop-shadow-2xl">{game.title}</h1>
        </div>

        {/* Rating Badge - Bottom Right */}
        <div className="absolute bottom-8 right-8 bg-[#16202d]/90 backdrop-blur-sm rounded-lg px-6 py-3 border border-[#2a475e]">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            <span className="text-3xl font-bold text-white">{game.rating}</span>
          </div>
          <p className="text-xs text-[#8f98a0] text-center mt-1">Rating</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Game Description */}
            <div>
              <p className="text-[#c7d5e0] text-base leading-relaxed mb-4">{game.description}</p>
              <div className="flex items-center gap-4 text-sm text-[#8f98a0]">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {reviews.length}K players online
                </span>
                <span>Released: {new Date(game.release_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Rating Breakdown Section */}
            <div className="bg-[#1e2c3c] rounded-lg p-6 border border-[#2a475e]/50">
              <div className="flex items-center gap-12">
                {/* Left Side - Large Rating Display */}
                <div className="flex flex-col items-center justify-center min-w-[140px]">
                  <div className="text-6xl font-black text-white mb-3">
                    {game.rating}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(game.rating / 2) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-[#4a5f70] fill-[#4a5f70]'
                          : 'text-[#4a5f70] fill-[#4a5f70]'
                      }`}
                      style={{
                        animation: `fadeIn 0.3s ease-out ${star * 0.1}s both`,
                        filter: star <= Math.floor(game.rating) ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))' : 'none'
                      }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#8f98a0] font-medium">Based on</p>
                  <p className="text-lg text-[#66c0f4] font-semibold">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                </div>
              </div>

              {/* Rating Bars */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((starRating, index) => {
                  // Calculate percentage distribution based on game rating
                  // For a rating like 8.9/10 (4.45/5), most reviews should be 5 and 4 stars
                  const gameRatingOutOf5 = game.rating / 2; // Convert 10-point to 5-point scale
                  
                  let percentage = 0;
                  if (gameRatingOutOf5 >= 4.5) {
                    // Excellent game (9.0-10.0): Heavy on 5 stars
                    percentage = starRating === 5 ? 75 : starRating === 4 ? 20 : starRating === 3 ? 3 : starRating === 2 ? 1 : 1;
                  } else if (gameRatingOutOf5 >= 4.0) {
                    // Great game (8.0-8.9): Mix of 5 and 4 stars
                    percentage = starRating === 5 ? 60 : starRating === 4 ? 30 : starRating === 3 ? 7 : starRating === 2 ? 2 : 1;
                  } else if (gameRatingOutOf5 >= 3.5) {
                    // Good game (7.0-7.9): Centered around 4 stars
                    percentage = starRating === 5 ? 35 : starRating === 4 ? 40 : starRating === 3 ? 18 : starRating === 2 ? 5 : 2;
                  } else if (gameRatingOutOf5 >= 3.0) {
                    // Average game (6.0-6.9): Centered around 3 stars
                    percentage = starRating === 5 ? 20 : starRating === 4 ? 25 : starRating === 3 ? 35 : starRating === 2 ? 15 : 5;
                  } else if (gameRatingOutOf5 >= 2.5) {
                    // Below average (5.0-5.9): More low ratings
                    percentage = starRating === 5 ? 10 : starRating === 4 ? 20 : starRating === 3 ? 30 : starRating === 2 ? 25 : 15;
                  } else {
                    // Poor game (<5.0): Heavy on low ratings
                    percentage = starRating === 5 ? 5 : starRating === 4 ? 10 : starRating === 3 ? 20 : starRating === 2 ? 30 : 35;
                  }
                  
                  const displayPercentage = percentage;
                  
                  return (
                    <div 
                      key={starRating}
                      className="flex items-center gap-4"
                      style={{
                        opacity: 0,
                        animation: `fadeInSlide 0.6s ease-out ${index * 0.15}s forwards`
                      }}
                    >
                      <div className="flex items-center gap-1 min-w-[80px]">
                        <span className="text-sm text-[#c7d5e0] font-medium w-3">{starRating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-4 bg-[#1e3447] rounded-full overflow-hidden border border-[#2a475e]/50">
                        <div 
                          className="h-full rounded-full relative"
                          style={{
                            width: `${displayPercentage}%`,
                            backgroundColor: '#3B82F6',
                            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            transitionDelay: `${index * 0.15}s`,
                            boxShadow: displayPercentage > 0 ? 'inset 0 1px 0 rgba(255,255,255,0.3)' : 'none'
                          }}
                        />
                      </div>
                      <span className="text-sm text-[#8f98a0] font-medium w-12 text-right">{percentage}%</span>
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
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <Lightbulb className="h-4 w-4 mr-2" />
              Tips & Tricks
            </TabsTrigger>
            <TabsTrigger value="wiki" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
              <BookOpen className="h-4 w-4 mr-2" />
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
                      <Button size="sm" className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white">
                        Write a Review
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
                          <Label htmlFor="rating" className="text-[#c7d5e0]">Rating (0-10)</Label>
                          <Input
                            id="rating"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={reviewForm.rating}
                            onChange={(e) => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0]"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pros" className="text-[#c7d5e0]">Pros (Optional)</Label>
                          <Input
                            id="pros"
                            value={reviewForm.pros}
                            onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0]"
                            placeholder="What did you like?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cons" className="text-[#c7d5e0]">Cons (Optional)</Label>
                          <Input
                            id="cons"
                            value={reviewForm.cons}
                            onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0]"
                            placeholder="What could be improved?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="content" className="text-[#c7d5e0]">Review Content</Label>
                          <Textarea
                            id="content"
                            value={reviewForm.content}
                            onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] min-h-[120px]"
                            placeholder="Write your detailed review..."
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setReviewDialogOpen(false)} className="border-[#2a475e] text-[#c7d5e0]">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb]">
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
                    <div key={review.id} className="p-4 rounded-lg bg-[#2a475e]/30 border border-[#2a475e] hover:bg-[#2a475e]/50 transition-all">
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
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm text-[#c7d5e0]">{review.rating}/10</span>
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
                      <Button size="sm" className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white">
                        Share a Tip
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
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0]"
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
                            className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] min-h-[120px]"
                            placeholder="Share your detailed tip or strategy..."
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setTipDialogOpen(false)} className="border-[#2a475e] text-[#c7d5e0]">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb]">
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
                    <div key={tip.id} className="p-5 rounded-lg bg-gradient-to-br from-[#2a475e]/50 to-[#1e3447]/50 border border-[#2a475e] hover:from-[#2a475e]/70 hover:to-[#1e3447]/70 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg flex-shrink-0">
                          <Lightbulb className="h-6 w-6 text-white" />
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
                <div className="p-5 rounded-lg bg-[#2a475e]/30 border border-[#2a475e]">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-3 text-[#c7d5e0]" style={{ fontWeight: 600 }}>Overview</h3>
                      <p className="text-sm text-[#c7d5e0] leading-relaxed">{game.description}</p>
                    </div>
                  </div>
                </div>

                {/* Game Details */}
                <div className="p-5 rounded-lg bg-[#2a475e]/30 border border-[#2a475e]">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center shadow-lg flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-white" />
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
      </div>
    </div>
  );
}
