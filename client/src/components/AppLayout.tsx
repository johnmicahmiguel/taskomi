import AuthGuard from "@/components/AuthGuard";
import AppSidebar from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeProvider } from "@/contexts/ThemeContext";

interface AppLayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
}

export default function AppLayout({ children, showRightSidebar = false }: AppLayoutProps) {
  return (
    <AuthGuard>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <div className="flex">
            {/* Left Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <div className="flex-1 p-4 lg:p-6 xl:p-8">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </div>

            {/* Right Sidebar (Optional) */}
            {showRightSidebar && (
              <div className="w-80 bg-card border-l border-border min-h-screen p-4 hidden lg:block">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Who to follow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Suggestions coming soon
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Trending topics coming soon
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </ThemeProvider>
    </AuthGuard>
  );
}