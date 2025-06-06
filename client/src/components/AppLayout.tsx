import AuthGuard from "@/components/AuthGuard";
import AppSidebar from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppLayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
}

export default function AppLayout({ children, showRightSidebar = false }: AppLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Left Sidebar */}
          <AppSidebar />

          {/* Main Content */}
          <div className="flex-1 max-w-2xl mx-auto p-4">
            {children}
          </div>

          {/* Right Sidebar (Optional) */}
          {showRightSidebar && (
            <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 min-h-screen p-4 hidden lg:block">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Who to follow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Suggestions coming soon
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Trending topics coming soon
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}