import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Building, Wrench, MapPin, Phone, Mail, ArrowLeft, LogOut, Star, Award, Settings, Edit, MessageSquare, Heart, Hash, MoreVertical, Trash2, MessageCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AuthGuard from "@/components/AuthGuard";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@shared/schema";

const businessTypes = [
  { value: "construction", label: "Construction" },
  { value: "real_estate", label: "Real Estate" },
  { value: "restaurant", label: "Restaurant" },
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "automotive", label: "Automotive" },
  { value: "energy", label: "Energy" },
  { value: "logistics", label: "Logistics" },
  { value: "entertainment", label: "Entertainment" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" }
];

export default function Profile() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/profile/:userType/:id");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine back button text based on referrer
  const getBackButtonText = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      if (referrer.includes('/feed')) {
        return 'Back to Feed';
      } else if (referrer.includes('/businesses') || referrer.includes('/contractors')) {
        return 'Back to Directory';
      }
    }
    return 'Back to Directory'; // Default
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
        navigate("/login");
      }
    }
  }, [navigate]);

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["/api/profile", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("No user ID provided");
      const response = await fetch(`/api/profile/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");
      return response.json();
    },
    enabled: !!params?.id
  });

  // Fetch user's posts
  const { data: userPostsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["/api/posts/user", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("No user ID provided");
      const response = await fetch(`/api/posts/user/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch user posts");
      return response.json();
    },
    enabled: !!params?.id
  });

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate("/");
  };

  if (!match || !params) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const user = profileData?.user;
  const userType = params.userType;
  const isOwnProfile = currentUser?.id === parseInt(params.id);
  const userPosts = userPostsData?.posts || [];

  // Like/Unlike mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!response.ok) throw new Error('Failed to like post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", variables.postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
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

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const toggleComments = (postId: number) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </header>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !user) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-slate-600 hover:text-primary"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {getBackButtonText()}
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {userType === "business" ? "Business" : "Contractor"} Profile
                </h1>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-slate-600 hover:text-primary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    user.userType === "business" ? "bg-primary/10" : "bg-accent/10"
                  }`}>
                    {user.userType === "business" ? (
                      <Building className={`h-10 w-10 ${user.userType === "business" ? "text-primary" : "text-accent"}`} />
                    ) : (
                      <Wrench className={`h-10 w-10 ${user.userType === "business" ? "text-primary" : "text-accent"}`} />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {user.companyName || `${user.firstName} ${user.lastName}`}
                    </CardTitle>
                    {user.companyName && (
                      <p className="text-lg text-muted-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={user.userType === "business" ? "default" : "secondary"}>
                        {user.userType === "business" ? "Business Owner" : "Contractor"}
                      </Badge>
                      {user.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!isOwnProfile && (
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.businessType && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{businessTypes.find(type => type.value === user.businessType)?.label || user.businessType}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About/Bio */}
              {user.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Skills (for contractors) */}
              {user.skills && user.skills.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications (for contractors) */}
              {user.certifications && user.certifications.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Certifications</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {user.tags && user.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <Separator />
              <div className="text-sm text-muted-foreground">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for About and Posts */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{user.phoneNumber}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      {user.businessType && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{businessTypes.find(type => type.value === user.businessType)?.label || user.businessType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About/Bio */}
                  {user.bio && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">About</h3>
                      <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {user.certifications && user.certifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.certifications.map((cert: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {user.tags && user.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.tags.map((tag: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member Since */}
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {isLoadingPosts ? (
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
              ) : userPosts.length > 0 ? (
                userPosts.map((post: any) => {
                  const { data: likedData } = isPostLikedQuery(post.id);
                  const { data: commentsData } = getCommentsQuery(post.id);
                  const isLiked = likedData?.liked || false;
                  const comments = commentsData?.comments || [];
                  const [localCommentInput, setLocalCommentInput] = useState("");

                  return (
                    <Card key={post.id} className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-500 text-white">
                              {post.user.firstName[0]}{post.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {post.user.companyName || `${post.user.firstName} ${post.user.lastName}`}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {post.user.userType}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(post.createdAt))} ago
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {post.content && (
                          <p className="text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap">
                            {post.content}
                          </p>
                        )}

                        {post.location && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {post.location}
                          </div>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag: string, index: number) => (
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
                                    <AvatarFallback className="bg-gray-500 text-white text-sm">
                                      {comment.user.firstName[0]}{comment.user.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                          {comment.user.companyName || `${comment.user.firstName} ${comment.user.lastName}`}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile ? "You haven't shared anything yet!" : "This user hasn't shared anything yet."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}