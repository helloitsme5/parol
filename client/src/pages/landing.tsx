import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldIcon, SearchIcon, SettingsIcon } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

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
            <Button 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-login"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Password Exposure Monitoring</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Check if your credentials have been exposed in data breaches. 
            Our comprehensive database helps you stay secure.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SearchIcon className="text-primary h-8 w-8" />
                <h3 className="text-lg font-semibold">User Search</h3>
              </div>
              <p className="text-muted-foreground">
                Enter your username to see how many data breaches have exposed your credentials across different websites.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SettingsIcon className="text-primary h-8 w-8" />
                <h3 className="text-lg font-semibold">Admin Panel</h3>
              </div>
              <p className="text-muted-foreground">
                Upload and process large breach databases, monitor processing status, and view comprehensive statistics.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
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
