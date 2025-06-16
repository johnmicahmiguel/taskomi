import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Building, Wrench, MapPin, Phone, Mail, ArrowLeft, Star, Award, Settings, Edit, MessageSquare, Heart, Hash, MoreVertical, Trash2, MessageCircle, Send } from "lucide-react";
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
import AppLayout from "@/components/AppLayout";
import SEOHead from "@/components/SEOHead";
import LoginPrompt from "@/components/LoginPrompt";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('currentUser');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Always fetch public profile data for SEO
  const { data: publicProfileData, isLoading: isLoadingPublic } = useQuery({
    queryKey: ["/api/profile", params?.id, "public"],
    queryFn: async () => {
      if (!params?.id) throw new Error("No user ID provided");
      const response = await fetch(`/api/profile/${params.id}/public`);
      if (!response.ok) throw new Error("Failed to fetch public profile");
      return response.json();
    },
    enabled: !!params?.id
  });

  // Fetch full profile data only if authenticated
  const { data: fullProfileData, isLoading: isLoadingFull } = useQuery({
    queryKey: ["/api/profile", params?.id, "full"],
    queryFn: async () => {
      if (!params?.id) throw new Error("No user ID provided");
      const response = await fetch(`/api/profile/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch full profile");
      return response.json();
    },
    enabled: !!params?.id && isAuthenticated
  });

  // Fetch user's posts only if authenticated
  const { data: userPostsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["/api/posts/user", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("No user ID provided");
      const response = await fetch(`/api/posts/user/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch user posts");
      return response.json();
    },
    enabled: !!params?.id && isAuthenticated
  });

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

  if (!match || !params) {
    return (
      <ThemeProvider>
        <SEOHead 
          title="Profile Not Found - Taskomi"
          description="The profile you're looking for doesn't exist on Taskomi."
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const publicUser = publicProfileData?.user;
  const fullUser = fullProfileData?.user;
  const user = isAuthenticated ? (fullUser || publicUser) : publicUser;
  const userType = params.userType;
  const isOwnProfile = currentUser?.id === parseInt(params.id);
  const userPosts = userPostsData?.posts || [];

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleCommentSubmit = (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (content) {
      createCommentMutation.mutate({ postId, content });
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    }
  };

  const toggleComments = (postId: number) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Generate SEO data
  const generateSEOData = () => {
    if (!publicUser) return {};

    const displayName = publicUser.companyName || `${publicUser.firstName} ${publicUser.lastName}`;
    const userTypeLabel = publicUser.userType === "business" ? "Business Owner" : "Contractor";
    const businessTypeLabel = publicUser.businessType ? 
      businessTypes.find(type => type.value === publicUser.businessType)?.label || publicUser.businessType : '';
    
    const title = `${displayName} - ${userTypeLabel} on Taskomi`;
    const description = publicUser.bio ? 
      `${publicUser.bio.substring(0, 150)}...` : 
      `Connect with ${displayName}, a ${userTypeLabel.toLowerCase()}${businessTypeLabel ? ` in ${businessTypeLabel}` : ''}${publicUser.location ? ` based in ${publicUser.location}` : ''} on Taskomi.`;
    
    const keywords = [
      publicUser.userType === "business" ? "business owner" : "contractor",
      businessTypeLabel,
      publicUser.location,
      "Taskomi",
      "marketplace",
      "services"
    ].filter(Boolean).join(", ");

    return { title, description, keywords };
  };

  const seoData = generateSEOData();

  if (isLoadingPublic) {
    return (
      <ThemeProvider>
        <SEOHead 
          title="Loading Profile - Taskomi"
          description="Loading user profile on Taskomi marketplace."
        />
        <div className="min-h-screen bg-background">
          {isAuthenticated ? (
            <AppLayout>
              <div className="space-y-6">
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
            </AppLayout>
          ) : (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          )}
        </div>
      </ThemeProvider>
    );
  }

  if (!publicUser) {
    return (
      <ThemeProvider>
        <SEOHead 
          title="Profile Not Found - Taskomi"
          description="The profile you're looking for doesn't exist on Taskomi."
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const ProfileContent = () => (
    <div className="space-y-6">
      {isAuthenticated && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {getBackButtonText()}
          </Button>
        </div>
      )}

      {/* Profile Header */}
      <Card>
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
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isOwnProfile && isAuthenticated && (
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              )}
              {isOwnProfile && isAuthenticated && (
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Information (always visible) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <div className="space-y-4">
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
              {user.bio && (
                <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
              )}
            </div>
          </div>

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

      {/* Authentication Gate */}
      {!isAuthenticated && (
        <LoginPrompt 
          userName={user.companyName || `${user.firstName} ${user.lastName}`}
          userType={user.userType}
        />
      )}

      {/* Authenticated Content */}
      {isAuthenticated && fullUser && (
        <>
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{fullUser.email}</span>
                </div>
                {fullUser.phoneNumber && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{fullUser.phoneNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills and Certifications */}
          {((fullUser.skills && fullUser.skills.length > 0) || (fullUser.certifications && fullUser.certifications.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {fullUser.skills && fullUser.skills.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fullUser.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {fullUser.certifications && fullUser.certifications.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Certifications</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fullUser.certifications.map((cert: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Posts ({userPosts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex space-x-3">
                          <div className="h-10 w-10 bg-muted rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-3 bg-muted rounded w-1/6"></div>
                            <div className="space-y-2">
                              <div className="h-3 bg-muted rounded"></div>
                              <div className="h-3 bg-muted rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post: any) => (
                    <Card key={post.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {post.user.firstName[0]}{post.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {post.user.companyName || `${post.user.firstName} ${post.user.lastName}`}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {post.user.userType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(post.createdAt))} ago
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {post.content && (
                          <p className="text-foreground mb-3 whitespace-pre-wrap">
                            {post.content}
                          </p>
                        )}

                        {post.location && (
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
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

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            <span>{post.likesCount}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.commentsCount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "You haven't shared anything yet!" : "This user hasn't shared anything yet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  return (
    <ThemeProvider>
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        ogTitle={seoData.title}
        ogDescription={seoData.description}
        ogUrl={typeof window !== 'undefined' ? `${window.location.origin}/profile/${userType}/${params.id}` : undefined}
        canonical={typeof window !== 'undefined' ? `${window.location.origin}/profile/${userType}/${params.id}` : undefined}
      />
      {isAuthenticated ? (
        <AppLayout>
          <ProfileContent />
        </AppLayout>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileContent />
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}