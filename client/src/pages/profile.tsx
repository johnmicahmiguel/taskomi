import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Building, Wrench, MapPin, Phone, Mail, ArrowLeft, LogOut, Star, Award, Settings, Edit, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import AuthGuard from "@/components/AuthGuard";
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
                <Button variant="ghost" asChild className="text-slate-600 hover:text-primary">
                  <Link href={userType === "business" ? "/businesses" : "/contractors"}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Directory
                  </Link>
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
        </div>
      </div>
    </AuthGuard>
  );
}