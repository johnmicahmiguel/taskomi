import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, MapPin, Hash, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

  // Fetch my feed posts
  const { data: myFeedData, isLoading: isLoadingMyFeed } = useQuery({
    queryKey: ["/api/posts"],
    enabled: activeTab === "my-feed",
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

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-4 border-gray-200 dark:border-gray-700">
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
              @{post.user.firstName.toLowerCase()}{post.user.lastName.toLowerCase()} • {formatDistanceToNow(new Date(post.createdAt))} ago
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
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>{post.likesCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout showRightSidebar={true}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Feed</h1>
        <p className="text-gray-600 dark:text-gray-400">Stay connected with the community</p>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Be the first to share something!</p>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No posts in your feed</h3>
              <p className="text-gray-600 dark:text-gray-400">Follow more people or create your first post!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}