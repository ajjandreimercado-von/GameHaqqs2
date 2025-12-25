import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Edit, Trash2, Plus, Upload, Star, Calendar, Gamepad2, Save, X, ImagePlus } from 'lucide-react';
import { api } from '../../lib/api';

interface Game {
  id: number;
  title: string;
  genre: string;
  release_date?: string;
  developer?: string;
  description?: string;
  platform?: string;
  image_url?: string;
  rating?: number;
}

interface GameManagementProps {
  games: Game[];
  loading: boolean;
  onRefresh: () => void;
  currentPage: number;
  totalPages: number;
  totalGames: number;
  onPageChange: (page: number) => void;
}

export function GameManagement({ 
  games: externalGames, 
  loading: externalLoading, 
  onRefresh,
  currentPage,
  totalPages,
  totalGames,
  onPageChange 
}: GameManagementProps) {
  const games = externalGames;
  const loading = externalLoading;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    release_date: '',
    developer: '',
    description: '',
    platform: '',
    rating: '',
  });

  // Remove the useEffect and fetchGames as data comes from props now
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      genre: '',
      release_date: '',
      developer: '',
      description: '',
      platform: '',
      rating: '',
    });
    setImageFile(null);
    setImagePreview('');
    setIsDialogOpen(true);
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      genre: game.genre,
      release_date: game.release_date || '',
      developer: game.developer || '',
      description: game.description || '',
      platform: game.platform || '',
      rating: game.rating?.toString() || '',
    });
    setImageFile(null);
    setImagePreview(game.image_url ? `http://127.0.0.1:8000/${game.image_url}` : '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('genre', formData.genre);
      if (formData.release_date) formDataToSend.append('release_date', formData.release_date);
      if (formData.developer) formDataToSend.append('developer', formData.developer);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.platform) formDataToSend.append('platform', formData.platform);
      if (formData.rating) formDataToSend.append('rating', formData.rating);
      if (imageFile) formDataToSend.append('image', imageFile);

      if (editingGame) {
        // Update existing game
        await api.updateGame(editingGame.id, formDataToSend);
        alert('Game updated successfully!');
      } else {
        // Create new game
        await api.createGame(formDataToSend);
        alert('Game added successfully!');
      }

      setIsDialogOpen(false);
      onRefresh(); // Call parent's refresh function
    } catch (error: any) {
      console.error('Failed to save game:', error);
      alert(`Failed to save game: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gameId: number) => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteGame(gameId);
      alert('Game deleted successfully!');
      onRefresh(); // Call parent's refresh function
    } catch (error) {
      console.error('Failed to delete game:', error);
      alert('Failed to delete game');
    }
  };

  return (
    <Card className="border-[#2a475e] steam-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-[#c7d5e0] flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-[#66c0f4]" />
              Games Management
            </CardTitle>
            <CardDescription className="text-[#8f98a0]">
              Add, edit, or remove games from the library
            </CardDescription>
          </div>
          <Button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab5e5] hover:to-[#2566a6] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Game
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full bg-[#2a475e]" />)}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="h-12 w-12 text-[#4a5f7a] mx-auto mb-4" />
            <p className="text-[#8f98a0] mb-4">No games found</p>
            <Button onClick={handleAdd} variant="outline" className="border-[#2a475e] text-[#66c0f4]">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Game
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a475e] hover:bg-[#2a475e]/30">
                  <TableHead className="text-[#8f98a0]">Image</TableHead>
                  <TableHead className="text-[#8f98a0]">Title</TableHead>
                  <TableHead className="text-[#8f98a0]">Genre</TableHead>
                  <TableHead className="text-[#8f98a0]">Platform</TableHead>
                  <TableHead className="text-[#8f98a0]">Release Date</TableHead>
                  <TableHead className="text-[#8f98a0]">Rating</TableHead>
                  <TableHead className="text-right text-[#8f98a0]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id} className="border-[#2a475e] hover:bg-[#2a475e]/30">
                    <TableCell>
                      {game.image_url ? (
                        <img 
                          src={`http://127.0.0.1:8000${game.image_url}`}
                          alt={game.title}
                          className="h-16 w-24 object-cover rounded border border-[#2a475e]"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-16 w-24 bg-[#16202d] rounded border border-[#2a475e] flex items-center justify-center ${game.image_url ? 'hidden' : ''}`}>
                        <ImagePlus className="h-6 w-6 text-[#4a5f7a]" />
                      </div>
                    </TableCell>
                    <TableCell className="text-[#c7d5e0] font-medium">{game.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#66c0f4]/30 text-[#66c0f4]">
                        {game.genre}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#8f98a0]">{game.platform || 'N/A'}</TableCell>
                    <TableCell className="text-[#8f98a0]">
                      {game.release_date ? new Date(game.release_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {game.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-[#c7d5e0] font-medium">{game.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-[#4a5f7a]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-[#2a475e] text-[#66c0f4] hover:bg-[#2a475e]"
                          onClick={() => handleEdit(game)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-[#2a475e] text-red-400 hover:bg-[#2a475e]"
                          onClick={() => handleDelete(game.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination Controls for Games */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a475e]">
                <div className="text-sm text-[#8f98a0]">
                  Showing {games.length} of {totalGames} games (Page {currentPage} of {totalPages})
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                  >
                    First
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => onPageChange(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] text-white border-0"
                              : "border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e]"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                  >
                    Next
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="border-[#2a475e] text-[#c7d5e0] hover:bg-[#2a475e] disabled:opacity-50"
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#1b2838] border-[#2a475e] text-[#c7d5e0] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#c7d5e0] text-2xl">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </DialogTitle>
              <DialogDescription className="text-[#8f98a0]">
                {editingGame ? 'Update game information and image' : 'Add a new game to the library'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-[#c7d5e0]">Game Cover Image</Label>
                <div className="flex gap-4 items-start">
                  {imagePreview && (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-40 w-60 object-cover rounded border-2 border-[#2a475e]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]"
                    />
                    <p className="text-xs text-[#8f98a0] mt-1">
                      Supported: JPG, PNG, GIF, WebP (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#c7d5e0]">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]"
                  placeholder="Enter game title"
                  required
                />
              </div>

              {/* Genre and Platform */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-[#c7d5e0]">Genre *</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]"
                    placeholder="e.g., Action-Adventure"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-[#c7d5e0]">Platform</Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]"
                    placeholder="e.g., PlayStation 5, PC"
                  />
                </div>
              </div>

              {/* Developer and Release Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="developer" className="text-[#c7d5e0]">Developer</Label>
                  <Input
                    id="developer"
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]"
                    placeholder="Enter developer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_date" className="text-[#c7d5e0] flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Release Date
                  </Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                    className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-[#c7d5e0] flex items-center gap-1">
                  <Star className="h-3 w-3" /> Rating (0-10)
                </Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]"
                  placeholder="Enter rating (e.g., 9.5)"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#c7d5e0]">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0] min-h-[100px]"
                  placeholder="Enter game description..."
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-[#2a475e] text-[#8f98a0] hover:bg-[#2a475e]"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab5e5] hover:to-[#2566a6] text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingGame ? 'Update Game' : 'Add Game'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
