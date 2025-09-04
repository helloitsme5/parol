import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { Link } from "wouter";
import UserSearch from "@/components/user-search";

export default function Landing() {

  return (
    <div className="min-h-screen bg-background text-foreground gradient-bg">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <ShieldIcon className="text-primary text-2xl h-8 w-8" />
              <h1 className="text-xl font-bold">SecureCheck</h1>
            </div>
            <Link href="/login">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-admin-login"
              >
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <UserSearch />

        {/* Admin Access */}
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="text-center">
                <SettingsIcon className="text-primary h-8 w-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Admin Access</h3>
                <p className="text-muted-foreground mb-4">
                  Administrators can upload and process breach databases, manage users, and view comprehensive statistics.
                </p>
                <Link href="/login">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    data-testid="button-admin-login"
                  >
                    Admin Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ShieldIcon className="text-primary h-5 w-5" />
              <span className="font-semibold">SecureCheck</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
