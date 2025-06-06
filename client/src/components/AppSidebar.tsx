import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Home, MessageSquare, Building, Wrench, User, Plus, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AppSidebar() {
  const [location] = useLocation();
  const [postType, setPostType] = useState<"text" | "media">("text");
  const [content, setContent] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [tags, setTags] = useState("");
  const [mediaUrls, setMediaUrls] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to logout");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/posts/for-you"] });
      clearForm();
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

  const clearForm = () => {
    setContent("");
    setLocationValue("");
    setTags("");
    setMediaUrls("");
    setPostType("text");
  };

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
      location: locationValue.trim() || null,
      tags: tags.trim() ? tags.split(",").map(tag => tag.trim()) : null,
    };

    createPostMutation.mutate(postData);
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
      <div className="space-y-6">
        {/* Logo/Brand */}
        <div className="px-2">
          <h2 className="text-xl font-bold text-primary">ConnectPro</h2>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <Button 
            variant="ghost" 
            asChild 
            className={`w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive("/dashboard") ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
            }`}
          >
            <Link href="/dashboard">
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            asChild
            className={`w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive("/feed") ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
            }`}
          >
            <Link href="/feed">
              <MessageSquare className="mr-3 h-5 w-5" />
              Feed
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            asChild 
            className={`w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive("/businesses") ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
            }`}
          >
            <Link href="/businesses">
              <Building className="mr-3 h-5 w-5" />
              Find Businesses
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            asChild 
            className={`w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive("/contractors") ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
            }`}
          >
            <Link href="/contractors">
              <Wrench className="mr-3 h-5 w-5" />
              Find Contractors
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            asChild 
            className={`w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive("/profile") ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
            }`}
          >
            <Link href="/profile">
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>
          </Button>

          <Button 
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOut className="mr-3 h-5 w-5" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </nav>

        {/* Post Button - Dialog Trigger */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="post-content">What's happening?</Label>
                <Textarea
                  id="post-content"
                  placeholder="Share your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="post-location">Location (optional)</Label>
                  <Input
                    id="post-location"
                    placeholder="Add location"
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="post-tags">Tags (optional)</Label>
                  <Input
                    id="post-tags"
                    placeholder="Add tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {postType === "media" && (
                <div>
                  <Label htmlFor="media-urls">Media URLs</Label>
                  <Input
                    id="media-urls"
                    placeholder="Enter media URLs (comma separated)"
                    value={mediaUrls}
                    onChange={(e) => setMediaUrls(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={postType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("text")}
                  >
                    Text
                  </Button>
                  <Button
                    type="button"
                    variant={postType === "media" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPostType("media")}
                  >
                    Media
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending || !content.trim()}
                  >
                    {createPostMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}