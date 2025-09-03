import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShieldIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <ShieldIcon className="text-primary text-2xl h-8 w-8" />
            <h1 className="text-xl font-bold">SecureCheck</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/"
              className={`flex items-center transition-colors ${
                location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="link-user-search"
            >
              <SearchIcon className="mr-2 h-4 w-4" />
              User Search
            </Link>
            {user?.role === 'admin' && (
              <Link 
                href="/admin"
                className={`flex items-center transition-colors ${
                  location === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid="link-admin-panel"
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            )}
            <div className="flex items-center space-x-2">
              {user && (
                <span className="text-sm text-muted-foreground" data-testid="text-user-email">
                  {user.email || 'User'}
                </span>
              )}
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
