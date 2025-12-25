import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, FileText, Clock, CheckCheck, Shield, MessageSquare, Image as ImageIcon, Video } from 'lucide-react';

interface Post {
  id: number;
  author: string;
  author_id?: number;
  avatar?: string;
  timestamp: string;
  content: string;
  title?: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  status: 'pending' | 'approved' | 'declined';
  reviewed_at?: string;
}

export function ModeratorDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    console.log('🔐 ModeratorDashboard: Current user:', user);
    console.log('🔑 ModeratorDashboard: Auth token:', localStorage.getItem('auth_token')?.substring(0, 30) + '...');
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('🔄 ModeratorDashboard: Starting to fetch all posts...');
      
      const data = await api.getAllModeratorPosts();
      console.log('📥 ModeratorDashboard: API response received:', data);
      console.log('📊 ModeratorDashboard: Response type:', typeof data, 'Is array:', Array.isArray(data));
      
      if (!data) {
        console.warn('⚠️ ModeratorDashboard: No data received from API');
        setPosts([]);
        return;
      }
      
      // Transform API data to component format
      const transformedPosts = (data || []).map((post: any) => ({
        id: post.id,
        author: post.author || (post.author_id ? `User #${post.author_id}` : 'Unknown'),
        author_id: post.author_id,
        avatar: '',
        timestamp: new Date(post.created_at).toLocaleString(),
        content: post.title ? `${post.title}\n\n${post.content}` : post.content,
        title: post.title,
        type: (post.image_url ? 'image' : post.video_url ? 'video' : 'text') as 'text' | 'image' | 'video',
        mediaUrl: post.image_url 
          ? (post.image_url.startsWith('http') ? post.image_url : `http://127.0.0.1:8000${post.image_url}`)
          : post.video_url 
          ? (post.video_url.startsWith('http') ? post.video_url : `http://127.0.0.1:8000${post.video_url}`)
          : undefined,
        status: post.status || 'pending',
        reviewed_at: post.reviewed_at,
      }));
      
      console.log('✅ ModeratorDashboard: Transformed posts:', transformedPosts);
      console.log('📈 ModeratorDashboard: Total posts:', transformedPosts.length);
      console.log('📋 Status breakdown:', {
        pending: transformedPosts.filter(p => p.status === 'pending').length,
        approved: transformedPosts.filter(p => p.status === 'approved').length,
        declined: transformedPosts.filter(p => p.status === 'declined').length,
      });
      
      setPosts(transformedPosts);
    } catch (error: any) {
      console.error('❌ ModeratorDashboard: Failed to fetch posts');
      console.error('❌ Error details:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      toast.error('Failed to load posts', {
        description: error?.message || 'Please check your connection and try again',
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedPost || !action) return;

    setProcessing(true);
    try {
      await api.reviewPost(selectedPost.id.toString(), action);
      
      if (action === 'approve') {
        toast.success('Post approved successfully', {
          description: 'The post is now visible in the community feed.',
        });
      } else {
        toast.success('Post declined successfully', {
          description: 'The post has been removed.',
        });
      }
      
      // Refresh posts
      await fetchPosts();
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

  const openDialog = (post: Post, actionType: 'approve' | 'reject') => {
    setSelectedPost(post);
    setAction(actionType);
  };

  const pendingPosts = posts.filter(p => p.status === 'pending');
  const approvedPosts = posts.filter(p => p.status === 'approved');
  const declinedPosts = posts.filter(p => p.status === 'declined');

  const stats = {
    pending: pendingPosts.length,
    flagged: declinedPosts.length,
    approved: approvedPosts.length,
  };

  const renderPostCard = (post: Post, showActions: boolean = false) => (
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
        <Badge 
          variant="outline" 
          className={
            post.status === 'approved' 
              ? 'border-green-500 text-green-500 bg-green-500/10'
              : post.status === 'declined'
              ? 'border-red-500 text-red-500 bg-red-500/10'
              : 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
          }
        >
          {post.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
          {post.status === 'declined' && <XCircle className="h-3 w-3 mr-1" />}
          {post.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
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
        <p className="text-sm text-[#c7d5e0] mb-3 whitespace-pre-wrap">{post.content}</p>
        
        {post.mediaUrl && post.type === 'image' && (
          <div className="rounded-lg overflow-hidden mt-3">
            <ImageWithFallback
              src={post.mediaUrl}
              alt="Post image"
              className="w-full h-auto max-h-64 object-cover"
            />
          </div>
        )}

        {post.mediaUrl && post.type === 'video' && (
          <div className="rounded-lg overflow-hidden relative h-48 bg-[#1b2838] mt-3">
            <ImageWithFallback
              src={post.mediaUrl}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="h-12 w-12 rounded-full bg-[#66c0f4]/80 flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
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
            Decline
          </Button>
        </div>
      )}

      {/* Reviewed timestamp for approved/declined */}
      {!showActions && post.reviewed_at && (
        <div className="text-xs text-[#8f98a0] mt-2 text-right">
          Reviewed {new Date(post.reviewed_at).toLocaleString()}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1b2838]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-[#2a475e] to-[#1e3447] border border-[#2a475e]">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#2a75bb] flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>Moderator Dashboard</h1>
              <p className="text-[#8f98a0]">Review and moderate community content</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="border-yellow-500/30 steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c7d5e0]">
                <Clock className="h-4 w-4 text-yellow-500" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-16 bg-[#16202d]" /> : (
                <div>
                  <div className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stats.pending}</div>
                  <p className="text-xs text-yellow-500 mt-1">Awaiting action</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-500/30 steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c7d5e0]">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Flagged Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-16 bg-[#16202d]" /> : (
                <div>
                  <div className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stats.flagged}</div>
                  <p className="text-xs text-red-400 mt-1">High priority</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-500/30 steam-card bg-gradient-to-br from-[#2a475e] to-[#1e3447]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-[#c7d5e0]">
                <CheckCheck className="h-4 w-4 text-green-500" />
                Approved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-16 bg-[#16202d]" /> : (
                <div>
                  <div className="text-3xl text-[#c7d5e0]" style={{ fontWeight: 700 }}>{stats.approved}</div>
                  <p className="text-xs text-green-400 mt-1">Great work!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Community Posts Section with Tabs */}
        <Card className="border-[#2a475e] steam-card">
          <CardHeader>
            <CardTitle className="text-[#c7d5e0] flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#16202d] border border-[#2a475e] mb-6">
                <TabsTrigger 
                  value="pending" 
                  className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pending ({pendingPosts.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="approved" 
                  className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approved ({approvedPosts.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="declined" 
                  className="data-[state=active]:bg-[#2a475e] data-[state=active]:text-[#66c0f4]"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Declined ({declinedPosts.length})
                </TabsTrigger>
              </TabsList>

              {/* Pending Tab */}
              <TabsContent value="pending">
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
                    {pendingPosts.map((post) => renderPostCard(post, true))}
                  </div>
                )}
              </TabsContent>

              {/* Approved Tab */}
              <TabsContent value="approved">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-[#8f98a0]">Loading approved posts...</p>
                  </div>
                ) : approvedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#2a475e] to-[#1e3447] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl mb-2 text-[#c7d5e0]">No Approved Posts</h3>
                    <p className="text-[#8f98a0]">Approved posts will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedPosts.map((post) => renderPostCard(post, false))}
                  </div>
                )}
              </TabsContent>

              {/* Declined Tab */}
              <TabsContent value="declined">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-[#8f98a0]">Loading declined posts...</p>
                  </div>
                ) : declinedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#2a475e] to-[#1e3447] flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl mb-2 text-[#c7d5e0]">No Declined Posts</h3>
                    <p className="text-[#8f98a0]">Declined posts will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {declinedPosts.map((post) => renderPostCard(post, false))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
                {action === 'approve' ? 'Approve Community Post?' : 'Decline Community Post?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8f98a0]">
                {action === 'approve' 
                  ? 'This post will be approved and made visible in the community feed.' 
                  : 'This post will be declined and removed. The author will be notified.'}
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
                {processing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Decline'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
