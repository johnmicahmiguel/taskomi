import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share, MapPin, Hash, MessageSquare, Trash2, Send, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { User } from "@shared/schema";

interface Post {
  id: number;
  userId: number;
  content: string;
  postType: string;
  mediaUrls: string[] | null;
  mediaType: string | null;
  location: string | null;
  tags: string[] | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    userType: string;
    companyName: string | null;
    businessType: string | null;
  };
}

export default function Feed() {
  const [activeTab, setActiveTab] = useState("my-feed");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
  }, []);

  // Fetch my feed posts (current user's posts only)
  const { data: myFeedData, isLoading: isLoadingMyFeed } = useQuery({
    queryKey: ["/api/posts", "userId", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { posts: [] };
      const response = await fetch(`/api/posts?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: activeTab === "my-feed" && !!currentUser?.id,
  });

  // Fetch for you feed posts
  const { data: forYouFeedData, isLoading: isLoadingForYou } = useQuery({
    queryKey: ["/api/posts/for-you"],
    enabled: activeTab === "for-you",
  });

  // Determine which posts to show based on active tab
  const posts: Post[] = activeTab === "my-feed" 
    ? (myFeedData as any)?.posts || []
    : (forYouFeedData as any)?.posts || [];

  const isLoading = activeTab === "my-feed" ? isLoadingMyFeed : isLoadingForYou;

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("DELETE", `/api/posts/${postId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/for-you"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete post.",
        variant: "destructive",
      });
    },
  });

  // Like/unlike post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/for-you"] });
    },
    onError: (error: any) => {
      toast({
        title: "Action failed",
        description: error.message || "Failed to update like status.",
        variant: "destructive",
      });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/for-you"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", variables.postId, "comments"] });
      setCommentInputs(prev => ({ ...prev, [variables.postId]: "" }));
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Comment failed",
        description: error.message || "Failed to post comment.",
        variant: "destructive",
      });
    },
  });

  // Get comments for a post
  const getCommentsQuery = (postId: number) => useQuery({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: showComments[postId] || false,
  });

  // Check if post is liked
  const isPostLikedQuery = (postId: number) => useQuery({
    queryKey: ["/api/posts", postId, "liked"],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/liked`);
      if (!response.ok) throw new Error('Failed to check like status');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const handleDeletePost = (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleCommentSubmit = (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (content) {
      createCommentMutation.mutate({ postId, content });
    }
  };

  const toggleComments = (postId: number) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const PostCard = ({ post }: { post: Post }) => {
    const { data: likedData } = isPostLikedQuery(post.id);
    const { data: commentsData } = getCommentsQuery(post.id);
    const isLiked = likedData?.liked || false;
    const comments = commentsData?.comments || [];
    
    // Local state for this specific post's comment input
    const [localCommentInput, setLocalCommentInput] = useState("");

    return (
      <Card className="mb-4 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {post.user.firstName[0]}{post.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Link href={`/profile/${post.user.userType}/${post.user.id}`}>
                    <h3 className="font-semibold text-foreground truncate hover:text-primary cursor-pointer">
                      {post.user.companyName || `${post.user.firstName} ${post.user.lastName}`}
                    </h3>
                  </Link>
                  <Badge variant="secondary" className="text-xs">
                    {post.user.userType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  @{post.user.firstName.toLowerCase()}{post.user.lastName.toLowerCase()} • {formatDistanceToNow(new Date(post.createdAt))} ago
                </p>
              </div>
            </div>
            
            {/* Show delete option only for own posts */}
            {currentUser && post.userId === currentUser.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {post.content && (
            <p className="text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap">
              {post.content}
            </p>
          )}
          
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="mb-3">
              {post.mediaType === "image" ? (
                <div className="grid grid-cols-2 gap-2">
                  {post.mediaUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="Post media"
                      className="rounded-lg max-h-64 w-full object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {post.mediaUrls.map((url, index) => (
                    <video
                      key={index}
                      src={url}
                      controls
                      className="rounded-lg max-h-64 w-full"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {post.location && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {post.location}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={() => handleLikePost(post.id)}
              disabled={likePostMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likesCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => toggleComments(post.id)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments[post.id] && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {/* Comment Input */}
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Write a comment..."
                  value={localCommentInput}
                  onChange={(e) => setLocalCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (localCommentInput.trim()) {
                        createCommentMutation.mutate({ 
                          postId: post.id, 
                          content: localCommentInput.trim() 
                        });
                        setLocalCommentInput("");
                      }
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (localCommentInput.trim()) {
                      createCommentMutation.mutate({ 
                        postId: post.id, 
                        content: localCommentInput.trim() 
                      });
                      setLocalCommentInput("");
                    }
                  }}
                  disabled={!localCommentInput.trim() || createCommentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                        {comment.user.firstName[0]}{comment.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <Link href={`/profile/${comment.user.userType}/${comment.user.id}`}>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:text-primary cursor-pointer">
                            {comment.user.firstName} {comment.user.lastName}
                          </p>
                        </Link>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout showRightSidebar={true}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Feed</h1>
        <p className="text-muted-foreground">Stay connected with the community</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-feed">My Feed</TabsTrigger>
          <TabsTrigger value="for-you">For You</TabsTrigger>
        </TabsList>

        <TabsContent value="my-feed" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-300 rounded"></div>
                          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Be the first to share something!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="for-you" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-300 rounded"></div>
                          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No posts in your feed</h3>
              <p className="text-muted-foreground">Follow more people or create your first post!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}