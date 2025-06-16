import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, UserPlus, LogIn } from "lucide-react";
import { Link } from "wouter";

interface LoginPromptProps {
  userName?: string;
  userType?: string;
}

export default function LoginPrompt({ userName, userType }: LoginPromptProps) {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">
          {userName ? `View ${userName}'s Full Profile` : "View Full Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {userName && userType ? (
            <>
              Connect with {userName} and other {userType === "business" ? "business owners" : "contractors"} on Taskomi. 
              Sign in to view complete profiles, contact information, and start collaborating.
            </>
          ) : (
            "Sign in to Taskomi to view complete profiles, contact information, and connect with professionals."
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href="/signup">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Link>
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Join thousands of businesses and contractors already using Taskomi
        </div>
      </CardContent>
    </Card>
  );
} 