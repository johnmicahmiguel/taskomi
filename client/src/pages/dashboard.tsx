import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Wrench, User, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user data in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
        setLocation("/login");
        return;
      }
    } else {
      setLocation("/login");
      return;
    }
    setIsLoading(false);
  }, [setLocation]);

  const handleLogout = () => {
    // Clear stored auth data and redirect
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary">ConnectPro</h1>
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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-slate-600">
            Here's what's happening with your {user.userType === "business" ? "business" : "contractor profile"} today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  user.userType === "business" ? "bg-primary/10" : "bg-accent/10"
                }`}>
                  {user.userType === "business" ? (
                    <Building className={`h-8 w-8 ${user.userType === "business" ? "text-primary" : "text-accent"}`} />
                  ) : (
                    <Wrench className={`h-8 w-8 ${user.userType === "business" ? "text-primary" : "text-accent"}`} />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant={user.userType === "business" ? "default" : "secondary"}>
                      {user.userType === "business" ? "Business Owner" : "Contractor"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.companyName && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <Building className="h-4 w-4" />
                  <span>{user.companyName}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-slate-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              {user.phoneNumber && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              
              {user.location && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}

              {user.skills && user.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Skills & Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {user.bio && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">About:</p>
                  <p className="text-slate-600">{user.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Profile Status:</span>
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Member since:</span>
                    <span className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!user.isVerified && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      Complete your profile verification to unlock all features.
                    </p>
                  </div>
                )}
                
                {user.userType === "business" && (
                  <Button className="w-full" variant="outline">
                    Post Your First Project
                  </Button>
                )}
                
                {user.userType === "contractor" && (
                  <Button className="w-full" variant="outline">
                    Browse Available Projects
                  </Button>
                )}
                
                <Button className="w-full" variant="outline">
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}