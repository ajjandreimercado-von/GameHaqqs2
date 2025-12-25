import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, MessageCircle, Image as ImageIcon, Video, FileText, Send, Clock, CheckCircle, Flag, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
  user_id: number;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  approved: boolean;
}

export function CommunityPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'image' | 'video',
    imageFile: null as File | null,
    videoFile: null as File | null,
    imagePreview: '' as string,
    videoPreview: '' as string,
  });
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [activeCommentSection, setActiveCommentSection] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.getCommunityPosts();
      const fetchedPosts = (response.data || []).map((post: any) => ({
        id: post.id,
        user_id: post.user_id,
        author: post.author || `User #${post.user_id}`,
        avatar: '',
        timestamp: new Date(post.created_at).toLocaleString(),
        content: post.content,
        type: post.image_url ? 'image' : post.video_url ? 'video' : 'text',
        mediaUrl: post.image_url ? `http://127.0.0.1:8000/${post.image_url}` : post.video_url ? `http://127.0.0.1:8000/${post.video_url}` : undefined,
        likes: post.likes || 0,
        comments: post.comments || [],
        liked: post.liked || false,
        approved: post.status === 'approved'
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim()) {
      alert('Please add a title to your post');
      return;
    }

    if (!newPost.content.trim()) {
      alert('Please add some content to your post');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      
      if (newPost.type === 'image' && newPost.imageFile) {
        formData.append('image', newPost.imageFile);
      }
      
      if (newPost.type === 'video' && newPost.videoFile) {
        formData.append('video', newPost.videoFile);
      }
      
      await api.createCommunityPost(formData);
      setNewPost({ 
        title: '', 
        content: '', 
        type: 'text', 
        imageFile: null, 
        videoFile: null,
        imagePreview: '',
        videoPreview: ''
      });
      setIsCreateDialogOpen(false);
      toast.success('Post submitted for approval', {
        description: 'Your post will be visible once a moderator approves it.',
      });
      // Refresh posts list
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await api.togglePostLike(postId);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: response.liked,
            likes: response.likes_count
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to like post', {
        description: 'Please try again.',
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('Image file size too large', {
          description: 'Image must be less than 5MB. Please compress or choose a smaller file.',
        });
        e.target.value = ''; // Reset input
        return;
      }
      
      setNewPost({ 
        ...newPost, 
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (20MB max to match backend validation)
      const maxSize = 20 * 1024 * 1024; // 20MB in bytes
      if (file.size > maxSize) {
        toast.error('Video file size too large', {
          description: 'Video must be less than 20MB. Please compress or choose a smaller file.',
        });
        e.target.value = ''; // Reset input
        return;
      }
      
      setNewPost({ 
        ...newPost, 
        videoFile: file,
        videoPreview: URL.createObjectURL(file)
      });
    }
  };

  const removeImage = () => {
    if (newPost.imagePreview) {
      URL.revokeObjectURL(newPost.imagePreview);
    }
    setNewPost({ ...newPost, imageFile: null, imagePreview: '' });
  };

  const removeVideo = () => {
    if (newPost.videoPreview) {
      URL.revokeObjectURL(newPost.videoPreview);
    }
    setNewPost({ ...newPost, videoFile: null, videoPreview: '' });
  };

  const handleComment = async (postId: number) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    try {
      const response = await api.addPostComment(postId, commentText);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const newComment: Comment = {
            id: response.comment.id,
            author: response.comment.author,
            avatar: '',
            content: response.comment.content,
            timestamp: 'Just now'
          };
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      }));

      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error: any) {
      console.error('Failed to post comment:', error);
      toast.error('Failed to post comment', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleReportPost = (post: Post) => {
    setReportingPost(post);
    setIsReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportingPost || !reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    try {
      await api.createReport(reportingPost.user_id, reportingPost.id, reportReason);
      toast.success('Report submitted successfully', {
        description: 'Thank you for helping keep our community safe!',
      });
      setIsReportDialogOpen(false);
      setReportReason('');
      setReportingPost(null);
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const approvedPosts = posts.filter(post => post.approved);

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <Card className="border-[#2a475e] bg-gradient-to-b from-[#16202d] to-[#171a21]">
        <CardContent className="p-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white">
                <FileText className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]">
              <DialogHeader>
                <DialogTitle className="text-[#c7d5e0]">Create Community Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#c7d5e0]">Title</Label>
                  <Input
                    id="title"
                    placeholder="Give your post a title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] focus:border-[#66c0f4]"
                    maxLength={150}
                  />
                </div>

                <Tabs value={newPost.type} onValueChange={(value) => setNewPost({ ...newPost, type: value as any })}>
                  <TabsList className="grid w-full grid-cols-3 bg-[#1b2838] border border-[#2a475e]">
                    <TabsTrigger value="text" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
                      <FileText className="h-4 w-4 mr-2" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="image" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]">
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-[#c7d5e0]">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your gaming experience..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="min-h-[120px] bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] focus:border-[#66c0f4]"
                  />
                </div>

                {newPost.type === 'image' && (
                  <div className="space-y-2">
                    <Label htmlFor="imageFile" className="text-[#c7d5e0]">Upload Image</Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] file:bg-[#66c0f4] file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded hover:file:bg-[#5ab0e0]"
                    />
                    {newPost.imagePreview && (
                      <div className="relative rounded-lg overflow-hidden border border-[#2a475e]">
                        <img src={newPost.imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={removeImage}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {newPost.type === 'video' && (
                  <div className="space-y-2">
                    <Label htmlFor="videoFile" className="text-[#c7d5e0]">Upload Video (Max 20MB)</Label>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/wmv"
                      onChange={handleVideoChange}
                      className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] file:bg-[#66c0f4] file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded hover:file:bg-[#5ab0e0]"
                    />
                    {newPost.videoPreview && (
                      <div className="relative rounded-lg overflow-hidden border border-[#2a475e]">
                        <video src={newPost.videoPreview} controls className="w-full h-48 object-cover bg-black" />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={removeVideo}
                          className="absolute top-2 right-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-[#2a475e]/50 rounded-lg text-sm text-[#8f98a0]">
                  <Clock className="h-4 w-4" />
                  <span>Your post will be reviewed by moderators before appearing in the community feed.</span>
                </div>

                <Button 
                  onClick={handleCreatePost}
                  className="w-full bg-gradient-to-r from-[#66c0f4] to-[#2a75bb] hover:from-[#5ab0e0] hover:to-[#236ba8] text-white"
                >
                  Submit Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {approvedPosts.length === 0 ? (
        <Card className="border-[#2a475e] bg-gradient-to-b from-[#16202d] to-[#171a21]">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-[#2a475e] flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-[#8f98a0]" />
            </div>
            <h3 className="text-xl mb-2 text-[#c7d5e0]">No posts yet</h3>
            <p className="text-[#8f98a0]">Be the first to share something with the community!</p>
          </CardContent>
        </Card>
      ) : (
        approvedPosts.map((post) => (
          <Card key={post.id} className="border-[#2a475e] bg-gradient-to-b from-[#16202d] to-[#171a21] overflow-hidden">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.avatar} alt={post.author} />
                    <AvatarFallback className="bg-[#2a475e] text-[#66c0f4]">
                      {post.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[#c7d5e0]">{post.author}</p>
                      {post.approved && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-500 bg-green-500/10">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#8f98a0]">{post.timestamp}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-[#2a475e] text-[#8f98a0]">
                  {post.type === 'image' && <ImageIcon className="h-3 w-3 mr-1" />}
                  {post.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                  {post.type === 'text' && <FileText className="h-3 w-3 mr-1" />}
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <p className="text-[#c7d5e0]">{post.content}</p>
              
              {post.mediaUrl && post.type === 'image' && (
                <div 
                  className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group relative"
                  onClick={() => {
                    setSelectedImage(post.mediaUrl!);
                    setIsImageModalOpen(true);
                  }}
                >
                  <ImageWithFallback
                    src={post.mediaUrl}
                    alt="Post image"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                      <ImageIcon className="h-8 w-8 text-[#16202d]" />
                    </div>
                  </div>
                </div>
              )}

              {post.mediaUrl && post.type === 'video' && (
                <div className="rounded-lg overflow-hidden">
                  <video 
                    src={post.mediaUrl}
                    controls
                    className="w-full h-auto max-h-96 bg-black"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2 border-t border-[#2a475e]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`gap-2 ${post.liked ? 'text-red-500' : 'text-[#8f98a0]'} hover:text-red-500`}
                >
                  <Heart className={`h-4 w-4 ${post.liked ? 'fill-red-500' : ''}`} />
                  <span>{post.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCommentSection(activeCommentSection === post.id ? null : post.id)}
                  className="gap-2 text-[#8f98a0] hover:text-[#66c0f4]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments.length}</span>
                </Button>
                {user && user.id !== post.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReportPost(post)}
                    className="gap-2 text-[#8f98a0] hover:text-red-400 ml-auto"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </Button>
                )}
              </div>

              {/* Comments Section */}
              {activeCommentSection === post.id && (
                <div className="space-y-4 pt-4 border-t border-[#2a475e]">
                  {/* Existing Comments */}
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatar} alt={comment.author} />
                        <AvatarFallback className="bg-[#2a475e] text-[#66c0f4] text-xs">
                          {comment.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-[#2a475e]/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-[#c7d5e0]">{comment.author}</p>
                          <p className="text-xs text-[#8f98a0]">{comment.timestamp}</p>
                        </div>
                        <p className="text-sm text-[#c7d5e0]">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                      className="bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] focus:border-[#66c0f4]"
                    />
                    <Button
                      onClick={() => handleComment(post.id)}
                      size="sm"
                      className="bg-[#66c0f4] hover:bg-[#5ab0e0] text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="bg-[#16202d] border-[#2a475e] text-[#c7d5e0]">
          <DialogHeader>
            <DialogTitle className="text-[#c7d5e0]">Report Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#8f98a0]">
              Help us keep the community safe by reporting content that violates our guidelines.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reportReason" className="text-[#c7d5e0]">Reason for reporting</Label>
              <Textarea
                id="reportReason"
                placeholder="Please explain why you're reporting this post..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="min-h-[120px] bg-[#2a475e] border-[#2a475e] text-[#c7d5e0] placeholder:text-[#8f98a0] focus:border-[#66c0f4]"
                maxLength={500}
              />
              <p className="text-xs text-[#8f98a0]">{reportReason.length}/500 characters</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportDialogOpen(false);
                  setReportReason('');
                  setReportingPost(null);
                }}
                className="flex-1 border-[#2a475e] text-[#8f98a0] hover:bg-[#2a475e]"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReport}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
