import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, MessageCircle, Share, Image, Video, MapPin, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";

type PostFormData = z.infer<typeof insertPostSchema>;

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
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postType, setPostType] = useState<"text" | "media">("text");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [mediaUrls, setMediaUrls] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["/api/posts"],
    enabled: true,
  });

  const posts: Post[] = (postsData as any)?.posts || [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsCreatingPost(false);
      setContent("");
      setLocation("");
      setTags("");
      setMediaUrls("");
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!content.trim() && postType === "text") {
      toast({
        title: "Error",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    if (postType === "media" && !mediaUrls.trim()) {
      toast({
        title: "Error",
        description: "Please add media URLs for your media post",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      content: content.trim() || null,
      postType,
      mediaUrls: postType === "media" && mediaUrls ? mediaUrls.split(",").map(url => url.trim()) : null,
      mediaType: postType === "media" ? mediaType : null,
      location: location.trim() || null,
      tags: tags.trim() ? tags.split(",").map(tag => tag.trim()) : null,
    };

    createPostMutation.mutate(postData);
  };

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

  const CreatePostCard = () => (
    <Card className="mb-6 border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        {!isCreatingPost ? (
          <Button 
            onClick={() => setIsCreatingPost(true)}
            className="w-full justify-start text-left bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            What's on your mind?
          </Button>
        ) : (
          <div className="space-y-4">
            <Tabs value={postType} onValueChange={(value) => setPostType(value as "text" | "media")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center space-x-2">
                  <span>Text</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center space-x-2">
                  <Image className="h-4 w-4" />
                  <span>Media</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="What's happening?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <Textarea
                  placeholder="Add a caption... (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[80px]"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as "image" | "video")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="image" className="flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span>Image</span>
                      </TabsTrigger>
                      <TabsTrigger value="video" className="flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span>Video</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mediaUrls">Media URLs (comma separated)</Label>
                  <Input
                    id="mediaUrls"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    value={mediaUrls}
                    onChange={(e) => setMediaUrls(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  placeholder="Add location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending}
                className="flex-1"
              >
                {createPostMutation.isPending ? "Posting..." : "Post"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreatingPost(false);
                  setContent("");
                  setLocation("");
                  setTags("");
                  setMediaUrls("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4">
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
            <CreatePostCard />
            
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
                <p className="text-gray-500 dark:text-gray-400 mb-4">No posts yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share something!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="for-you" className="space-y-4">
            <CreatePostCard />
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">For You feed coming soon</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">We're working on personalized recommendations</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}