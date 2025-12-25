import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CheckCircle, XCircle, Image as ImageIcon, Video, FileText, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface PendingPost {
  id: number;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
}

export function PendingPostsModeration() {
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<PendingPost | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getModeratorPosts();
      console.log('📥 Fetched pending posts:', data);
      
      // Transform API data to component format
      const transformedPosts = (data || []).map((post: any) => ({
        id: post.id,
        author: post.author || post.author_id ? `User #${post.author_id}` : 'Unknown',
        avatar: '',
        timestamp: new Date(post.created_at).toLocaleString(),
        content: post.title ? `${post.title}\n\n${post.content}` : post.content,
        type: (post.image_url ? 'image' : post.video_url ? 'video' : 'text') as 'text' | 'image' | 'video',
        mediaUrl: post.image_url ? `http://127.0.0.1:8000${post.image_url}` : post.video_url ? `http://127.0.0.1:8000${post.video_url}` : undefined,
      }));
      
      console.log('✅ Transformed posts:', transformedPosts);
      setPendingPosts(transformedPosts);
    } catch (error) {
      console.error('❌ Failed to fetch pending posts:', error);
      setPendingPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedPost || !action) return;

    setProcessing(true);
    try {
      // Call real API endpoint
      await api.reviewPost(selectedPost.id.toString(), action);
      
      if (action === 'approve') {
        toast.success('Post approved successfully', {
          description: 'The post is now visible in the community feed.',
        });
      } else {
        toast.success('Post rejected successfully', {
          description: 'The post has been removed and the author has been notified.',
        });
      }
      
      console.log(`Post ${action}d successfully`);
      
      // Remove post from pending list
      setPendingPosts(pendingPosts.filter(p => p.id !== selectedPost.id));
      setSelectedPost(null);
      setAction(null);
    } catch (error) {
      console.error('Failed to process action:', error);
      toast.error('Failed to process action', {
        description: 'Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openDialog = (post: PendingPost, actionType: 'approve' | 'reject') => {
    setSelectedPost(post);
    setAction(actionType);
  };

  return (
    <div className="space-y-6">
      <Card className="border-[#2a475e] steam-card">
        <CardHeader>
          <CardTitle className="text-[#c7d5e0] flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending Community Posts ({pendingPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#8f98a0]">Loading pending posts...</p>
            </div>
          ) : pendingPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-2 text-[#c7d5e0]">All Caught Up!</h3>
              <p className="text-[#8f98a0]">No pending posts to review at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div 
                  key={post.id}
                  className="p-5 rounded-lg border border-[#2a475e] bg-gradient-to-br from-[#2a475e]/50 to-[#1e3447]/50 hover:from-[#2a475e]/70 hover:to-[#1e3447]/70 transition-all"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.avatar} alt={post.author} />
                        <AvatarFallback className="bg-[#2a475e] text-[#66c0f4]">
                          {post.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-[#c7d5e0]" style={{ fontWeight: 600 }}>{post.author}</p>
                        <p className="text-xs text-[#8f98a0]">{post.timestamp}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>

                  {/* Post Type Badge */}
                  <div className="mb-3">
                    <Badge variant="outline" className="border-[#2a475e] text-[#8f98a0]">
                      {post.type === 'image' && <ImageIcon className="h-3 w-3 mr-1" />}
                      {post.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                      {post.type === 'text' && <FileText className="h-3 w-3 mr-1" />}
                      {post.type.charAt(0).toUpperCase() + post.type.slice(1)} Post
                    </Badge>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4 p-4 bg-[#16202d]/80 rounded-lg border border-[#2a475e]/50">
                    <p className="text-sm text-[#c7d5e0] mb-3">{post.content}</p>
                    
                    {post.mediaUrl && post.type === 'image' && (
                      <div 
                        className="rounded-lg overflow-hidden mt-3 cursor-pointer hover:opacity-90 transition-opacity group relative"
                        onClick={() => {
                          setSelectedImage(post.mediaUrl!);
                          setIsImageModalOpen(true);
                        }}
                      >
                        <ImageWithFallback
                          src={post.mediaUrl}
                          alt="Post image"
                          className="w-full h-auto max-h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                            <ImageIcon className="h-6 w-6 text-[#16202d]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {post.mediaUrl && post.type === 'video' && (
                      <div className="rounded-lg overflow-hidden mt-3">
                        <video 
                          src={post.mediaUrl}
                          controls
                          className="w-full h-auto max-h-64 bg-black"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <Button 
                      size="sm" 
                      className="bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30"
                      onClick={() => openDialog(post, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                      onClick={() => openDialog(post, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={selectedPost !== null && action !== null} onOpenChange={() => {
        setSelectedPost(null);
        setAction(null);
      }}>
        <AlertDialogContent className="bg-[#16202d] border-[#2a475e]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#c7d5e0]">
              {action === 'approve' ? 'Approve Community Post?' : 'Reject Community Post?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8f98a0]">
              {action === 'approve' 
                ? 'This post will be approved and made visible in the community feed.' 
                : 'This post will be rejected and removed. The author will be notified. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing} className="bg-[#2a475e] text-[#c7d5e0] border-[#2a475e] hover:bg-[#2a475e]/70">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAction}
              disabled={processing}
              className={action === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
            >
              {processing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Lightbox Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black/95 border-[#2a475e] p-0 overflow-hidden">
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all group"
          >
            <X className="h-6 w-6 text-white group-hover:text-red-400" />
          </button>
          <div className="flex items-center justify-center w-full h-full p-8">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={() => setIsImageModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
