import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Wrench, User, Mail, Phone, MapPin, Shield, ShieldCheck, Clock, Briefcase } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AppLayout from "@/components/AppLayout";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [displayedOtp, setDisplayedOtp] = useState("");

  useEffect(() => {
    // Check for user data in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        localStorage.removeItem('currentUser');
        // Use setTimeout to avoid updating component during render
        setTimeout(() => setLocation("/login"), 0);
        return;
      }
    } else {
      // Use setTimeout to avoid updating component during render
      setTimeout(() => setLocation("/login"), 0);
      return;
    }
  }, [setLocation]);

  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/send-otp", { email });
      return await response.json();
    },
    onSuccess: (data) => {
      setIsOtpSent(true);
      if (data.developmentOtp) {
        setDisplayedOtp(data.developmentOtp);
        toast({
          title: "Verification code generated",
          description: "Your verification code is displayed below.",
        });
      } else {
        toast({
          title: "Verification code sent",
          description: "Please check your email for the verification code.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send verification code",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/verify-otp", { email, otp });
      return await response.json();
    },
    onSuccess: (data) => {
      // Update user data in localStorage and state
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setUser(data.user);
      setIsVerificationOpen(false);
      setOtp("");
      setIsOtpSent(false);
      setDisplayedOtp("");
      toast({
        title: "Account verified!",
        description: "Your account has been successfully verified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = () => {
    sendOtpMutation.mutate(user.email);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      verifyOtpMutation.mutate({ email: user.email, otp });
    }
  };

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
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your {user.userType === "business" ? "business" : "contractor profile"} today.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Profile Card */}
        <Card className="xl:col-span-3">
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
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Building className="h-4 w-4" />
                <span>{user.companyName}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                {user.isVerified ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                        <Shield className="h-3 w-3 mr-1" />
                        Get Verified
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Verify Your Account</DialogTitle>
                        <DialogDescription>
                          {!isOtpSent 
                            ? "We'll send a verification code to your email address."
                            : "Enter the 6-digit code sent to your email."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {!isOtpSent ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                            <Button 
                              onClick={handleSendOtp}
                              disabled={sendOtpMutation.isPending}
                              className="w-full"
                            >
                              {sendOtpMutation.isPending ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                "Send Verification Code"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {displayedOtp && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                <p className="text-sm text-blue-600 mb-2">Your verification code:</p>
                                <div className="text-2xl font-mono font-bold text-blue-800 tracking-wider">
                                  {displayedOtp}
                                </div>
                                <p className="text-xs text-blue-500 mt-2">Copy this code and enter it below</p>
                              </div>
                            )}
                            <div>
                              <Label htmlFor="otp">Verification Code</Label>
                              <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsOtpSent(false);
                                  setOtp("");
                                  setDisplayedOtp("");
                                }}
                                disabled={verifyOtpMutation.isPending}
                                className="flex-1"
                              >
                                Send New Code
                              </Button>
                              <Button
                                onClick={handleVerifyOtp}
                                disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                                className="flex-1"
                              >
                                {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            
            {user.phoneNumber && (
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Phone className="h-4 w-4" />
                <span>{user.phoneNumber}</span>
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}

            {user.skills && user.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills & Expertise:</p>
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
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">About:</p>
                <p className="text-slate-600 dark:text-slate-400">{user.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with ConnectPro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
            
            {user.userType === "business" ? (
              <>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation("/job-orders")}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Job Order
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setLocation("/contractors")}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Find Contractors
                </Button>
              </>
            ) : (
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setLocation("/businesses")}
              >
                <Building className="h-4 w-4 mr-2" />
                Find Businesses
              </Button>
            )}
            
            <Button onClick={handleLogout} className="w-full justify-start" variant="outline">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}