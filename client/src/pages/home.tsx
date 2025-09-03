import { useState } from "react";
import Navigation from "@/components/navigation";
import UserSearch from "@/components/user-search";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldIcon } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground gradient-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserSearch />
        
        {user?.role === 'admin' && (
          <div className="max-w-2xl mx-auto mt-8">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="text-center">
                  <ShieldIcon className="text-primary h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Admin Access</h3>
                  <p className="text-muted-foreground mb-4">
                    You have administrative privileges. Access the admin panel to manage breach databases.
                  </p>
                  <Link 
                    href="/admin" 
                    className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                    data-testid="link-admin-panel"
                  >
                    Go to Admin Panel
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
